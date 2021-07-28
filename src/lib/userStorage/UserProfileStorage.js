// @flow
import { get, isFunction, isString, keys } from 'lodash'
import { App } from 'realm-web'
import { sha3 } from 'web3-utils'
import { getUserModel } from '../gundb/UserModel'
import type { UserModel } from '../gundb/UserModel'
import { ExceptionCategory } from '../logger/exceptions'
import Base64Storage from '../nft/Base64Storage'
import { isValidBase64Image, isValidCIDImage } from '../utils/image'
import pino from '../logger/pino-logger'
import isEmail from '../validators/isEmail'
import isMobilePhone from '../validators/isMobilePhone'

const logger = pino.child({ from: 'UserProfileStorage' })

/**
 * User's profile field data
 */
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy,
}

export interface ProfileDB {
  user: App;
}
type ACK = {
  ok: number,
  err: string,
}

export class UserProfileStorage {
  constructor(wallet: GoodWallet, profiledb: ProfileDB) {
    // const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    // this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    this.wallet = wallet
    this.profiledb = profiledb
  }

  profileSettings: {} = {
    fullName: { defaultPrivacy: 'public' },
    email: { defaultPrivacy: 'private' },
    mobile: { defaultPrivacy: 'private' },
    mnemonic: { defaultPrivacy: 'private' },
    avatar: { defaultPrivacy: 'public' },
    smallAvatar: { defaultPrivacy: 'public' },
    walletAddress: { defaultPrivacy: 'public' },
    username: { defaultPrivacy: 'public' },
  }

  static indexableFields = {
    email: true,
    mobile: true,
    mnemonic: true,
    phone: true,
    walletAddress: true,
    username: true,
  }

  subscribersProfileUpdates = []

  walletAddressIndex = {}

  static cleanHashedFieldForIndex = (field: string, value: string): string => {
    if (value === undefined) {
      return value
    }
    if (field === 'mobile' || field === 'phone') {
      return sha3(value.replace(/[_-\s]+/g, ''))
    }
    return sha3(`${value}`.toLowerCase())
  }

  static isValidValue(field: string, value: string, trusted: boolean = false) {
    const cleanValue = UserProfileStorage.cleanHashedFieldForIndex(field, value)

    if (!cleanValue) {
      logger.warn(
        `indexProfileField - field ${field} value is empty (value: ${value})`,
        cleanValue,
        new Error('isValidValue failed'),
        { category: ExceptionCategory.Human },
      )
      return false
    }

    return true
  }

  _getProfileFields = profile => keys(profile).filter(field => !['_', 'initialized'].includes(field))

  //TODO:  make sure profile contains walletaddress or enforce it in schema in realmdb
  setProfile(profile): Promise<any> {
    this.profiledb.Profiles.updateOne(
      { user_id: this.profiledb.user.id },
      { user_id: this.profiledb.user.id, ...profile },
      { upsert: true },
    )
  }

  getProfile(): Promise<any> {
    return this.profiledb.Profiles.findOne({ user_id: this.profiledb.user.id })
  }

  getProfileByWalletAddress(walletAddress: string): Promise<any> {
    return this.profiledb.Profiles.findOne({ walletAddress })
  }

  setProfileFields(fields: { key: String, field: ProfileField }): Promise<any> {
    return this.profiledb.Profiles.updateOne({ user_id: this.profiledb.user.id }, { $set: fields })
  }

  removeAvatar(withCleanup?: boolean): Promise<(void | ACK)[]> {
    return Promise.all(
      // eslint-disable-next-line require-await
      ['avatar', 'smallAvatar'].map(async field => {
        // eslint-disable-next-line require-await
        const updateRealmDB = async () => this.setProfileFields({ [field]: null })

        if (true !== withCleanup) {
          return updateRealmDB()
        }

        return this._removeBase64(field, updateRealmDB)
      }),
    )
  }

  async _storeAvatar(field: string, avatar: string, withCleanup = false): Promise<string> {
    const cid = await Base64Storage.store(avatar)
    // eslint-disable-next-line require-await
    const updateRealmDB = async () => this.setProfileFields({ [field]: cid })
    if (withCleanup !== true) {
      return updateRealmDB()
    }

    return this.setProfileFields({ [field]: avatar })
  }

  async _removeBase64(field: string, updateRealmCallback = null): Promise<void> {
    const cid = await this.getProfileFieldValue(field)

    if (isFunction(updateRealmCallback)) {
      await updateRealmCallback()
    }

    if (isString(cid) && !isValidBase64Image(cid) && isValidCIDImage(cid)) {
      await Base64Storage.delete(cid)
    }
  }

  // TODO: todo
  // async initProfile(): Promise<void> {}

  getProfileFieldValue(field: string): Promise<string> {
    return this.getProfile().then(data => data[field]).value
  }

  getProfileFieldDisplayValue(field: string): Promise<string> {
    return this.getProfile().then(data => data[field].display)
  }

  getProfileField(field: string): Promise<string> {
    return this.getProfile().then(data => data[field])
  }

  // TODO: verify
  getDisplayProfile(profile: {}): UserModel {
    const displayProfile = Object.keys(profile).reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: get(profile, `${currKey}.display`),
      }),
      {},
    )
    return getUserModel(displayProfile)
  }

  // TODO: verify
  getPrivateProfile(profile: {}): Promise<UserModel> {
    const keys = this._getProfileFields(profile)
    return Promise.all(keys.map(currKey => this.getProfileFieldValue(currKey)))
      .then(values => {
        return values.reduce((acc, currValue, index) => {
          const currKey = keys[index]
          return { ...acc, [currKey]: currValue }
        }, {})
      })
      .then(getUserModel)
  }

  async getFieldPrivacy(field: string): Promise<any> {
    const currentPrivacy = await this.getProfile().then(data => data[field].privacy)

    return currentPrivacy || this.profileSettings[field].defaultPrivacy || 'public'
  }

  async validateProfile(profile: any): Promise<{ isValid: boolean, errors: {} }> {
    if (!profile) {
      return { isValid: false, errors: {} }
    }
    const fields = Object.keys(profile).filter(prop => UserProfileStorage.indexableFields[prop])

    const validatedFields = await Promise.all(
      fields.map(async field => ({
        field,
        valid: await UserProfileStorage.isValidValue(field, profile[field], true),
      })),
    )

    const errors = validatedFields.reduce((accErrors, curr) => {
      if (!curr.valid) {
        accErrors[curr.field] = `Unavailable ${curr.field}`
      }
      return accErrors
    }, {})

    const isValid = validatedFields.every(elem => elem.valid)
    logger.debug({ fields, validatedFields, errors, isValid, profile })

    return { isValid, errors }
  }

  // TODO: check privacy field requirments
  async setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK> {
    let value = await this.getProfileFieldValue(field)
    return value

    // return this.setProfileField(field, value, privacy, true)
  }

  // TODO: ??? gunDB method is not working
  isUsername(username: string): Promise<boolean> {}

  // TODO: i think this should be named -> getUserProfileByField
  async getUserProfile(field?: string): { name: string, avatar: string } {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'
    const profile = await this.profiledb.Profiles.findOne({ [attr]: field })
    const { fullName, avatar } = profile
    if (profile == null) {
      logger.info(`getUserProfile by field <${field}> `)
      return { name: undefined, avatar: undefined }
    }

    logger.info(`getUserProfile by field <${field}>`, { avatar, fullName })
    if (!fullName) {
      logger.info(`cannot get fullName from gun by field <${field}>`, { fullName })
    }
    return { name: fullName, avatar }
  }

  unSubscribeProfileUpdates() {
    this.subscribersProfileUpdates = []
  }

  deleteProfile(): Promise<boolean> {
    this.unSubscribeProfileUpdates()
  }
}
