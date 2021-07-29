// @flow
import { get, isEmpty, isFunction, isString, keys } from 'lodash'
import { App } from 'realm-web'
import { sha3 } from 'web3-utils'
import { getUserModel } from '../gundb/UserModel'
import type { UserModel } from '../gundb/UserModel'
import { ExceptionCategory } from '../logger/exceptions'
import Base64Storage from '../nft/Base64Storage'
import { retry } from '../utils/async'
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

  profileDefaults: {} = {
    mobile: '',
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

  serialize(field: string, value: any): any {
    const { profileDefaults } = this
    const defaultValue = profileDefaults[field]
    const hasDefaultValue = field in profileDefaults
    const isFieldEmpty = isString(value) && isEmpty(value)

    if (isFieldEmpty || (hasDefaultValue && value === defaultValue)) {
      return null
    }

    return value
  }

  static maskField = (fieldType: 'email' | 'mobile' | 'phone', value: string): string => {
    if (fieldType === 'email') {
      let parts = value.split('@')
      return `${parts[0][0]}${'*'.repeat(parts[0].length - 2)}${parts[0][parts[0].length - 1]}@${parts[1]}`
    }
    if (['mobile', 'phone'].includes(fieldType)) {
      return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`
    }
    return value
  }

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

  setProfileField(
    field: string,
    value: string,
    privacy: FieldPrivacy = 'public',
    onlyPrivacy: boolean = false,
  ): Promise<ACK> {
    let display

    switch (privacy) {
      case 'private':
        display = '******'
        break
      case 'masked':
        display = UserProfileStorage.maskField(field, value)

        //undo invalid masked field
        if (display === value) {
          privacy = 'public'
        }
        break
      case 'public':
        display = value
        break
      default:
        throw new Error('Invalid privacy setting', { privacy })
    }

    const storePrivacy = () =>
      this.profiledb.Profiles.updateOne({ user_id: this.profiledb.user.id }, { $set: { [field]: display } })

    if (onlyPrivacy) {
      return storePrivacy()
    }

    logger.debug('setProfileField', { field, value, privacy, onlyPrivacy, display })

    return this.profiledb.Profiles.updateOne(
      { user_id: this.profiledb.user.id },
      { $set: { [field]: this.serialize(field, value) } },
    )
  }

  removeAvatar(withCleanup?: boolean): Promise<(void | ACK)[]> {
    return Promise.all(
      // eslint-disable-next-line require-await
      ['avatar', 'smallAvatar'].map(async field => {
        // eslint-disable-next-line require-await
        const updateRealmDB = async () => this.setProfileField(field, null, 'public')

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
    const updateRealmDB = async () => this.setProfileField(field, cid, 'public')
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

  async initProfile(): Promise<void> {}

  getProfileFieldValue(field: string): Promise<string> {
    return this.getProfile().then(data => data[field])
  }

  getProfileFieldDisplayValue(field: string): Promise<string> {
    return this.getProfile().then(data => data[field].display)
  }

  getProfileField(field: string): Promise<string> {
    return this.getProfile().then(data => data[field])
  }

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

  async setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK> {
    let value = await this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy, true)
  }

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

  async deleteProfile(): Promise<boolean> {
    this.unSubscribeProfileUpdates()

    // first delete from indexes then delete the profile itself
    let profileFields = await this.getProfile().then(this._getProfileFields)

    const deleteField = field => {
      if (!field.includes('avatar')) {
        return this.setProfileFieldPrivacy(field, 'private')
      }

      if (field === 'avatar') {
        return this.removeAvatar()
      }
    }

    await Promise.all(
      profileFields.map(field =>
        retry(() => deleteField(field), 1).catch(exception => {
          let error = exception
          let { message } = error || {}

          if (!error) {
            error = new Error(`Deleting profile field ${field} failed`)
            message =
              'Some error occurred during' +
              (field === 'avatar' ? 'deleting avatar' : 'setting the privacy to the field')
          }

          logger.error(`Deleting profile field ${field} failed`, message, error, { index: field })
        }),
      ),
    )

    return true
  }
}
