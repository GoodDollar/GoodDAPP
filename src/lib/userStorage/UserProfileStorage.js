// @flow
import { get, isEmpty, isFunction, isString, keys, over } from 'lodash'
import { App } from 'realm-web'
import { sha3 } from 'web3-utils'
import { getUserModel } from '../gundb/UserModel'
import type { UserModel } from '../gundb/UserModel'
import { UserStorage } from '../gundb/UserStorageClass'
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

export type Profile = { [key: string]: ProfileField }

export interface ProfileDB {
  setProfile(profile: Profile): Promise<void>;
  getProfile(): Promise<any>;
  getProfileByField(key: string, field: string): Promise<any>;
  getProfileByWalletAddress(walletAddress: string): Promise<any>;
  setProfileFields(fields: { key: String, field: ProfileField }): Promise<any>;
  _encrypt(feedItem: string): string;
  _encryptField(feedItem: string): string;
  _decrypt(item: { encrypted: string }): string;
}

type ACK = {
  ok: number,
  err: string,
}

//TODO:
//2. create an interface ProfileStorage, UserProfileStorage implements ProfileStorage
//3. do all the TODO in file
//4. document methods and verify methods input types and return types are correct
//4b. make sure async/await usage is correct as some methods are no longer async
//5. implement pubsub for profile changes (one method to subscribe for profile updates, when profile changes notify the subscribers)
//6. UserStorageClass should delegate all calls to UserProfileStorage
export class UserProfileStorage {
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

  subscribersProfileUpdates = []

  walletAddressIndex = {}

  //unecrypted profile field values
  profile: { [key: string]: ProfileField } = {}

  constructor(wallet: GoodWallet, profiledb: ProfileDB) {
    // const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    // this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    this.wallet = wallet
    this.profiledb = profiledb
  }

  /**
   * read raw profile from database
   */
  async init() {
    const rawProfile = await this.profiledb.getProfile()
    Object.keys(rawProfile).map(
      async item =>
        (this.profile[item] = {
          ...rawProfile[item],
          value: await this.profiledb._decrypt({ encrypted: rawProfile[item].value }),
        }),
    )
  }

  /**
   * encrypt decrypted profile
   * @param {*} profile
   */
  async _encryptProfileFields(profile): Promise<any> {
    let encryptProfile = {}
    let { user_id, _id, ...fields } = profile
    await Promise.all(
      Object.keys(fields).map(
        async field =>
          (encryptProfile[field] = {
            ...profile[field],
            value: await this.profiledb._encryptField(profile[field].value),
          }),
      ),
    )
    return encryptProfile
  }

  /**
   * saves a complete profile to the underlying storage
   * @param {*} profile
   */
  async setProfile(profile) {
    const encryptedProfile = await this._encryptProfileFields(profile)
    await this.profiledb.setProfile(encryptedProfile)
    this.profile = profile
  }

  /**
   * gets the current unencrypted field values in-memory
   * @returns
   */
  getProfile(): Profile {
    return this.profile
  }

  /**
   * updates profile fields in storage
   * @param {*} fields
   * @returns
   */
  async setProfileFields(fields: { [key: string]: ProfileField }): Promise<any> {
    const encryptedFields = await this._encryptProfileFields(fields)
    return Promise.all([
      this.profiledb.setProfileFields(encryptedFields),
      (this.profile = { ...this.profile, ...fields }),
    ])
  }

  /**
   *
   * @param {*} field
   * @param {*} value
   * @param {*} privacy
   * @param {*} onlyPrivacy
   * @returns
   */
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
        display = UserStorage.maskField(field, value)

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

    logger.debug('setProfileField', { field, value, privacy, onlyPrivacy, display })

    return this.setProfileFields({ [field]: { display, value, privacy } })
  }

  //TODO: ask alexey about cleanup
  // removeAvatar(): Promise<void> {
  //   //get the current smallAvatar/avatar fields values (which should be ipfs pointers)
  //   //call _removeBase64 to delete them from cache
  //   //set both avatar+smallavatar fields value to null
  //   return Promise.all(
  //     // eslint-disable-next-line require-await
  //     ['avatar', 'smallAvatar'].map(async field => {
  //       // eslint-disable-next-line require-await
  //       this._removeBase64(field, updateRealmDB)
  //     }),
  //   )
  //   //TODO: update both smallAvatar/avatar to null
  //   return this.setProfileFields(field, null, 'public')
  // }

  //TODO: ask alexey baout cleanup
  async _storeAvatar(field: string, avatar: string, withCleanup = false): Promise<string> {
    const cid = await Base64Storage.store(avatar)
    // eslint-disable-next-line require-await
    const updateRealmDB = async () => this.setProfileField(field, cid, 'public')
    if (withCleanup !== true) {
      return updateRealmDB()
    }

    this.setProfileField(field, cid, 'public')
    return this.setProfileFields({ [field]: avatar })
  }

  async _removeBase64(field: string, updateRealmCallback = null): Promise<void> {
    const cid = await this.getProfileFieldValue(field)

    if (isString(cid) && !isValidBase64Image(cid) && isValidCIDImage(cid)) {
      await Base64Storage.delete(cid)
    }
  }

  /**
   * get another user public profile by wallet address
   * @param {*} walletAddress
   * @returns
   */
  getProfileByWalletAddress(walletAddress: string): Promise<any> {
    return this._getPublicProfile('walletAddress', walletAddress)
  }

  /**
   * helper to get form storage a user public profile by key/value
   * @param {*} field
   * @param {*} value
   */
  _getPublicProfile(key: string, value: string): { [field: string]: string } {
    //TODO: implement getPublicProfile on RealmDB which returns only fields where privacy isnt private
    // let profile = await this.profiledb.getPublicProfile(key, value)
    //TODO: filter from profile the private fields and keep only the 'display' value
    //TODO: fetch smallAvatar
    // profile['smallAvatar'] = await Base64Storage...(profile['smallAvatar'])
  }

  getProfileFieldValue(field: string): string {
    return this.profile[field].value
  }

  getProfileFieldDisplayValue(field: string): Promise<string> {
    return this.profile[field].display
  }

  // TODO: remove this field and its usages, ProfilePrivacy should just use the complete profile
  // getProfileField(field: string): Promise<string> {
  //   return this.getProfile().then(data => data[field])
  // }

  //TODO: modify usage in undux/effect
  getDisplayProfile(): UserModel {
    const displayProfile = Object.keys(this.profile).reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: get(profile, `${currKey}.display`),
      }),
      {},
    )
    return getUserModel(displayProfile)
  }

  //TODO: modify usage in undux/effect
  getPrivateProfile(): UserModel {
    const displayProfile = Object.keys(this.profile).reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: get(profile, `${currKey}.value`),
      }),
      {},
    )
    return getUserModel(displayProfile)
  }

  getFieldPrivacy(field: string): string {
    const currentPrivacy = this.profile[field].privacy

    return currentPrivacy || this.profileSettings[field].defaultPrivacy || 'public'
  }

  async validateProfile(profile: any): Promise<{ isValid: boolean, errors: {} }> {
    if (!profile) {
      return { isValid: false, errors: {} }
    }
    const fields = Object.keys(profile).filter(prop => UserStorage.indexableFields[prop])

    const validatedFields = await Promise.all(
      fields.map(async field => ({
        field,
        valid: await UserStorage.isValidValue(field, profile[field].value, true),
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

  setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK> {
    let value = this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy, true)
  }

  //TODO: merge logic with _getPublicProfile
  /**
   * return user profile by field value
   * @param field
   * @returns {Promise<{name: undefined, avatar: undefined}|{name, avatar}>}
   */
  async getUserProfile(field?: string): { name: string, avatar: string } {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'

    const profile = await this.profiledb.getProfileByField(attr, field)
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

  notifyProfileUpdates() {
    over(this.subscribersProfileUpdates)(this.profile)
  }

  subscribeProfileUpdates(callback: any => void) {
    this.subscribersProfileUpdates.push(callback)
    if (this.profile) {
      callback(this.profile)
    }
  }

  unSubscribeProfileUpdates() {
    this.subscribersProfileUpdates = []
  }

  async deleteProfile(): Promise<boolean> {
    this.unSubscribeProfileUpdates()

    //TODO: delete avatars from Base64Storage/cache

    //TODO: delete user record from realmdb

    return true
  }
}
