// @flow
import { assign, debounce, over, toPairs } from 'lodash'
import { ExceptionCategory } from '../logger/exceptions'
import Base64Storage from '../nft/Base64Storage'
import { isValidBase64Image, resizeImage } from '../utils/image'
import pino from '../logger/pino-logger'
import isEmail from '../validators/isEmail'
import isMobilePhone from '../validators/isMobilePhone'
import type { UserModel } from './UserModel'
import { getUserModel } from './UserModel'
import { UserStorage } from './UserStorageClass'

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

type ACK = {
  ok: number,
  err: string,
}

export interface ProfileDB {
  setProfile(profile: Profile): Promise<void>;
  getProfile(): Promise<any>;
  getProfileByField(key: string, field: string): Promise<any>;
  getProfileByWalletAddress(walletAddress: string): Promise<any>;
  getPublicProfile(key: string, field: string): Promise<any>;
  setProfileFields(fields: { key: String, field: ProfileField }): Promise<any>;
  encryptField(item: string): string;
  decryptField(item: string): string;
  deleteProfile(): Promise<any>;
}

// private methods couldn't be a part of the interface
// by definition interface describes only public API
// so they have been removed
export interface ProfileStorage {
  init(): Promise<any>;
  setProfile(profile: Profile): Promise<any>;
  getProfile(): Profile;
  setProfileFields(fields: { [key: string]: ProfileField }): Promise<any>;
  setProfileField(field: string, value: string, privacy: FieldPrivacy, onlyPrivacy: boolean): Promise<ACK>;
  setAvatar(avatar: string): Promise<void>;
  removeAvatar(): Promise<void>;
  getProfileByWalletAddress(walletAddress: string): Promise<any>;
  getPublicProfile(key: string, value: string): { [field: string]: string };
  getProfileFieldValue(field: string): string;
  getProfileFieldDisplayValue(field: string): string;
  getProfileField(field: string): ProfileField;
  getDisplayProfile(): UserModel;
  getPrivateProfile(): UserModel;
  getFieldPrivacy(field: string): string;
  validateProfile(profile: any): Promise<{ isValid: boolean, errors: {} }>;
  setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK>;
  getUserProfile(field?: string): { name: string, avatar: string };
  deleteProfile(): Promise<boolean>;
}

//5. implement pubsub for profile changes (one method to subscribe for profile updates, when profile changes notify the subscribers)
export class UserProfileStorage implements ProfileStorage {
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

  _lastProfileUpdate: any

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
    this._setLocalProfile(await this._decryptProfileFields(rawProfile))
  }

  /**
   * helper for setting value of local profile state
   * @param newValue
   * @private
   */
  _setLocalProfile(newValue) {
    // this.subscribeProfileUpdates(newValue)
    this.profile = newValue
    const onProfileUpdate = debounce(
      doc => {
        this._lastProfileUpdate = doc
        over(this.subscribersProfileUpdates)(doc)
      },
      500,
      { leading: false, trailing: true },
    )
    onProfileUpdate(newValue)
  }

  /**
   * helper for decrypt profile values
   * @param profile
   * @returns {Promise<{}>}
   * @private
   */
  async _decryptProfileFields(profile): Promise<any> {
    const outputProfile = {}
    if (profile == null || typeof profile !== 'object') {
      return {}
    }
    await Promise.all(
      Object.keys(profile).map(
        async item =>
          typeof profile[item]?.value === 'string' &&
          (outputProfile[item] = {
            ...profile[item],
            value: await this.profiledb.decryptField(profile[item]?.value),
          }),
      ),
    )
    return outputProfile
  }

  /**
   * encrypt decrypted profile
   * @param {*} profile
   */
  async _encryptProfileFields(profile): Promise<any> {
    let encryptProfile = {}
    await Promise.all(
      Object.keys(profile).map(
        async field =>
          typeof profile[field]?.value === 'string' &&
          (encryptProfile[field] = {
            ...profile[field],
            value: await this.profiledb.encryptField(profile[field]?.value),
          }),
      ),
    )
    return encryptProfile
  }

  /**
   * saves a complete profile to the underlying storage
   * @param {*} profile
   * @param update
   */
  async setProfile(profile, update: boolean = false): Promise<any> {
    if (profile && !profile.validate) {
      profile = getUserModel(profile)
    }
    const fields = Object.keys(profile).filter(prop => UserStorage.indexableFields[prop])
    let { errors, isValid } = profile.validate(update)

    if (!isValid) {
      logger.warn(
        'setProfile failed',
        'Fields validation failed',
        new Error('setProfile failed: Fields validation failed'),
        { errors, category: ExceptionCategory.Human },
      )

      throw errors
    }

    const { avatar } = profile

    if (!!avatar && isValidBase64Image(avatar)) {
      const cids = await this._resizeAndStoreAvatars(avatar)

      assign(profile, cids)
    }

    const fieldsToSave = fields.reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: {
          value: profile[currKey],
          display: profile[currKey],
          privacy: this.getFieldPrivacy(currKey),
        },
      }),
      {},
    )

    return this.setProfileFields(fieldsToSave)
  }

  /**
   * gets the current unencrypted field values in-memory
   * @returns
   */
  getProfile(): Profile {
    return Object.keys(this.profile).reduce((acc, currKey) => ({ ...acc, [currKey]: this.profile[currKey].value }), {})
  }

  /**
   * updates profile fields in storage
   * @param {*} fields
   * @returns
   */
  async setProfileFields(fields: { [key: string]: ProfileField }): Promise<any> {
    const encryptedFields = await this._encryptProfileFields(fields)

    await this.profiledb.setProfileFields(encryptedFields)
    this._setLocalProfile({ ...this.profile, ...fields })
  }

  /**
   * Set profile field with privacy
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

  /**
   * @returns {Promise<CID[]>}
   */
  async setAvatar(avatar) {
    const cids = await this._resizeAndStoreAvatars(avatar)

    await Promise.all(
      // eslint-disable-next-line require-await
      toPairs(cids).map(async ([field, value]) => this.setProfileField(field, value, 'public')),
    )
  }

  /**
   * remove Avatar from profile
   * @returns {Promise<[Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>]>}
   */
  async removeAvatar(withCleanup = false): Promise<void> {
    await Promise.all(
      // eslint-disable-next-line require-await
      ['avatar', 'smallAvatar'].map(async field => this.setProfileField(field, '', 'public')),
    )
  }

  /**
   * store Avatar
   * @param field
   * @param avatarDataUrl
   * @param withCleanup
   * @returns {Promise<{ avatar: CID, smallAvatar: CID }>}
   */
  async _resizeAndStoreAvatars(avatarDataUrl: string): Promise<{ avatar: string, smallAvatar: string }> {
    let resizedDataUrl
    const avatarSizes = [320, 50]

    const resizedAvatars = await Promise.all(
      avatarSizes.map(async size => {
        resizedDataUrl = await resizeImage(resizedDataUrl || avatarDataUrl, size)

        return resizedDataUrl
      }),
    )

    // TODO: replace via IPFS.store() call once #3370 will be merged
    const [avatar, smallAvatar] = await Promise.all(
      // eslint-disable-next-line require-await
      resizedAvatars.map(async dataUrl => Base64Storage.store(dataUrl)),
    )

    return { avatar, smallAvatar }
  }

  /**
   * get another user public profile by wallet address
   * @param {*} walletAddress
   * @returns
   */
  getProfileByWalletAddress(walletAddress: string): Promise<any> {
    return this.profiledb.getProfileByWalletAddress(walletAddress)
  }

  /**
   * helper to get a user public profile by key/value
   * @param key
   * @param {*} value
   */
  async getPublicProfile(key: string, value: string): Promise<{ [field: string]: string }> {
    const rawProfile = await this.profiledb.getProfileByField(key, value)
    if (!rawProfile) {
      return null
    }
    let publicProfile = Object.keys(rawProfile)
      .filter(key => rawProfile[key].privacy !== 'private')
      .reduce(
        (acc, currKey) => ({
          ...acc,
          [currKey]: rawProfile[currKey].display,
        }),
        {},
      )

    // publicProfile.smallAvatar = await Base64Storage.load(this.profile.smallAvatar)
    return publicProfile
  }

  getProfileFieldValue(field: string): string {
    return this.profile[field]?.value
  }

  getProfileFieldDisplayValue(field: string): string {
    return this.profile[field]?.display
  }

  getProfileField(field: string): { value: string, display: string, privacy: string } {
    return this.profile[field]
  }

  /**
   * Return display attribute of each profile property
   * @returns {UserModel}
   */
  getDisplayProfile(): UserModel {
    const displayProfile = Object.keys(this.profile).reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: this.profile[currKey]?.display,
      }),
      {},
    )
    return getUserModel(displayProfile)
  }

  /**
   * Returns user model with attribute values
   * @returns {UserModel}
   */
  getPrivateProfile(): UserModel {
    const displayProfile = Object.keys(this.profile).reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: this.profile[currKey]?.value,
      }),
      {},
    )
    return getUserModel(displayProfile)
  }

  getFieldPrivacy(field: string): string {
    const currentPrivacy = this.profile[field]?.privacy

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
        valid: await UserStorage.isValidValue(field, profile[field], true),
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

  /**
   * return public user profile by field value
   * @param field - Profile field value (email, mobile or wallet address value)
   * @returns {object} profile - { name, avatar }
   */
  async getUserProfile(field?: string): { name: string, avatar: string } {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'

    const profile = await this.getPublicProfile(attr, field)
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
    if (this._lastProfileUpdate) {
      callback(this._lastProfileUpdate)
    }
  }

  unSubscribeProfileUpdates() {
    this.subscribersProfileUpdates = []
  }

  /**
   * Delete profile
   * @returns {Promise<[Promise<void>, Promise<*>]>}
   */
  async deleteProfile(): Promise<boolean> {
    this.unSubscribeProfileUpdates()
    await this.removeAvatar()
    await this.profiledb.deleteProfile()
    this._setLocalProfile({})
  }
}
