// @flow
import { get, isEmpty, isFunction, isString, keys, over } from 'lodash'
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

export type Profile = { [key: string]: ProfileField }
export interface ProfileDB {
  user: App;
}
type ACK = {
  ok: number,
  err: string,
}

//TODO:
//1. userprofilestorage should be inside UserStorageClass, either instantiated inside or passed into constructor
//2. create correct ProfileDB interface, move back the mongodb methods to RealmDB, RealmDB implements ProfileDB
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

  //unecrypted profile field values
  profile: { [key: string]: ProfileField} = {}

  constructor(wallet: GoodWallet, profiledb: ProfileDB) {
    // const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    // this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    this.wallet = wallet
    this.profiledb = profiledb
  }

  //TODO: implement init
  /**
   * read raw profile from database
   * store unencrypted version in memory
   */
  init() {
    let rawProfile = this._getProfile()
    //TODO: here profile should be the same, just with value replaced with unecnrypted value
    this.profile = rawProfile.map(f => _decrypt(f.value))
  }

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

  //TODO:  make sure profile contains walletaddress or enforce it in schema in realmdb
  /**
   * saves a complete profile to the underlying storage
   * //TODO: decide if it expects values to be encrypted or it encrypts them before
   * @param {*} profile
   */
  setProfile(profile): Promise<any> {
    //TODO: make sure profile values are encrypted
    this.profiledb.Profiles.updateOne(
      { user_id: this.profiledb.user.id },
      { user_id: this.profiledb.user.id, ...profile },
      { upsert: true },
    )
    //TODO: update in-memory profile
  }

  /**
   * read the complete raw user profile from storage. result fields might be encrypted
   */
  _getProfile(): Promise<any> {
    return this.profiledb.Profiles.findOne({ user_id: this.profiledb.user.id })
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
  setProfileFields(fields: { [key: string]: ProfileField }): Promise<any> {
    //TODO: does it first encrypt the values or it expects value to be encrypted?
    //TODO: update also the in-memory this.profile
    return this.profiledb.Profiles.updateOne({ user_id: this.profiledb.user.id }, { $set: fields })
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

    logger.debug('setProfileField', { field, value, privacy, onlyPrivacy, display })

    return this.setProfileFields({ [field]: { display, value, privacy } })
  }

  //TODO: ask alexey about cleanup
  removeAvatar(): Promise<void> {
    //get the current smallAvatar/avatar fields values (which should be ipfs pointers)
    //call _removeBase64 to delete them from cache
    //set both avatar+smallavatar fields value to null
    return Promise.all(
      // eslint-disable-next-line require-await
      ['avatar', 'smallAvatar'].map(async field => {
        // eslint-disable-next-line require-await        
        this._removeBase64(field, updateRealmDB)
      }),
    )
    //TODO: update both smallAvatar/avatar to null
    return this.setProfileFields(field, null, 'public')
  }

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
    return this._getPublicProfile('walletAddress',walletAddress)
  }

  /**
   * helper to get form storage a user public profile by key/value
   * @param {*} field 
   * @param {*} value 
   */
  _getPublicProfile(key: string,value:string):{[field:string]: string} {
    //TODO: implement getPublicProfile on RealmDB which returns only fields where privacy isnt private
    let profile = await this.profiledb.getPublicProfile(key, value)
    //TODO: filter from profile the private fields and keep only the 'display' value
    
    //TODO: fetch smallAvatar
    profile['smallAvatar'] = await Base64Storage...(profile['smallAvatar'])
  }

  getProfileFieldValue(field: string): string {
    return this.profile[field].value
  }

  getProfileFieldDisplayValue(field: string): Promise<string> {
    return this.profile[field].display
  }

  //TODO: remove this field and its usages, ProfilePrivacy should just use the complete profile
  getProfileField(field: string): Promise<string> {
    return this.getProfile().then(data => data[field])
  }

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

  async getFieldPrivacy(field: string): Promise<any> {
    const currentPrivacy = this.profile[field].privacy

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
    let value = this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy, true)
  }

  //TODO: merge logic with _getPublicProfile
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
