// @flow
import { assign, toPairs } from 'lodash'

import { ExceptionCategory } from '../logger/exceptions'
import IPFS from '../ipfs/IpfsStorage'
import { AVATAR_SIZE, resizeImage, SMALL_AVATAR_SIZE } from '../utils/image'
import { isValidDataUrl } from '../utils/base64'
import pino from '../logger/pino-logger'
import isEmail from '../validators/isEmail'
import isMobilePhone from '../validators/isMobilePhone'
import type { UserModel } from './UserModel'
import { getUserModel } from './UserModel'
import type { FieldPrivacy, Profile, ProfileField } from './UserStorageClass'
import { isValidValue, maskField } from './utlis'

const logger = pino.child({ from: 'UserProfileStorage' })

export interface ProfileDB {
  setProfile(profile: Profile): Promise<void>;
  getProfile(): Promise<Profile>;
  getProfileByField(key: string, field: string): Promise<Profile>;
  getPublicProfile(key: string, field: string): Promise<Profile>;
  setProfileFields(fields: Profile): Promise<void>;
  encryptField(item: string): string;
  decryptField(item: string): string;
  deleteProfile(): Promise<boolean>;
}

// private methods couldn't be a part of the interface
// by definition interface describes only public API
// so they have been removed
export interface ProfileStorage {
  init(): Promise<void>;
  setProfile(profile: Profile): Promise<void>;
  getProfile(): { [key: string]: string };
  setProfileFields(fields: Profile): Promise<void>;
  setProfileField(field: string, value: string, privacy: FieldPrivacy, onlyPrivacy: boolean): Promise<void>;
  setAvatar(avatar: string): Promise<void>;
  removeAvatar(): Promise<void>;
  getProfileByWalletAddress(walletAddress: string): Promise<Profile>;
  getPublicProfile(key: string, value: string): { [field: string]: string };
  getProfileFieldValue(field: string): string;
  getProfileFieldDisplayValue(field: string): string;
  getProfileField(field: string): ProfileField;
  getDisplayProfile(): UserModel;
  getPrivateProfile(): UserModel;
  getFieldPrivacy(field: string): string;
  validateProfile(profile: any): Promise<{ isValid: boolean, errors: {} }>;
  setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<void>;
  getUserProfile(field?: string): { name: string, avatar: string };
  deleteProfile(): Promise<boolean>;
}

//5. implement pubsub for profile changes (one method to subscribe for profile updates, when profile changes notify the subscribers)
export class UserProfileStorage implements ProfileStorage {
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

  indexableFields = {
    email: true,
    mobile: true,
    mnemonic: true,
    phone: true,
    walletAddress: true,
    username: true,
  }

  walletAddressIndex = {}

  //unecrypted profile field values
  profile: Profile = {}

  constructor(wallet: GoodWallet, profiledb: ProfileDB) {
    // const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    // this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    this.wallet = wallet
    this.profiledb = profiledb
  }

  /**
   * read raw profile from database
   */
  async init(): Promise<void> {
    const rawProfile = await this.profiledb.getProfile()
    const decryptedProfile = await this._decryptProfileFields(rawProfile)

    this._setLocalProfile(decryptedProfile)
  }

  /**
   * helper for setting value of local profile state
   * @param newValue
   * @private
   */
  _setLocalProfile(newValue: Profile): void {
    this.profile = newValue
  }

  /**
   * helper for decrypt profile values
   * @param profile
   * @returns {Promise<{}>}
   * @private
   */
  async _decryptProfileFields(profile: Profile): Promise<Profile> {
    const decryptedProfile = {}

    if (!profile) {
      return {}
    }

    await Promise.all(
      Object.keys(profile).map(
        async item =>
          typeof profile[item]?.value === 'string' &&
          (decryptedProfile[item] = {
            ...profile[item],
            value: await this.profiledb.decryptField(profile[item]?.value).catch(e => {
              logger.warn('decryptProfileFields: failed decrypting profile field', e.message, e, { item })
              return ''
            }),
          }),
      ),
    )

    return decryptedProfile
  }

  /**
   * encrypt decrypted profile
   * @param {*} profile
   */
  async _encryptProfileFields(profile: Profile): Promise<Profile> {
    const encryptProfile = {}

    await Promise.all(
      Object.keys(profile).map(
        async field =>
          (encryptProfile[field] =
            profile[field] === null
              ? null
              : {
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
  async setProfile(profile: { [key: string]: string }, update: boolean = false): Promise<void> {
    if (profile && !profile.validate) {
      profile = getUserModel(profile)
    }

    const fields = Object.keys(profile).filter(prop => prop in this.profileSettings)
    let { errors, isValid } = profile.validate(update)

    // enforce profile to have walletAddress
    if (!update || !fields.walletAddress) {
      isValid = false
      errors.walletAddress = 'walletAddress is required in profile'
    }

    if (!isValid) {
      const errorMessage = 'Fields validation failed'

      logger.warn('setProfile failed', errorMessage, new Error(errorMessage), {
        errors,
        category: ExceptionCategory.Human,
      })

      throw errors
    }

    const { avatar } = profile

    if (!!avatar && isValidDataUrl(avatar)) {
      const cids = await this._resizeAndStoreAvatars(avatar)

      assign(profile, cids)
    }

    const fieldsToSave = fields.reduce(
      (acc, currKey) => ({
        ...acc,
        [currKey]: {
          value: profile[currKey],
          display: this._setDisplayFieldBasedOnPrivacy(currKey, profile[currKey], this.getFieldPrivacy(currKey)),
          privacy: this.getFieldPrivacy(currKey),
        },
      }),
      {},
    )

    if (!update) {
      return this.setNewProfileFields(fieldsToSave)
    }

    return this.setProfileFields(fieldsToSave)
  }

  /**
   * gets the current unencrypted field values in-memory
   * @returns
   */
  getProfile(): { [key: string]: string } {
    return Object.keys(this.profile).reduce(
      (acc, currKey) => ({ ...acc, [currKey]: this.profile[currKey]?.value ?? null }),
      {},
    )
  }

  /**
   * updates profile fields in realm
   * @param {*} fields
   * @returns
   */
  async setProfileFields(fields: Profile): Promise<void> {
    const encryptedFields = await this._encryptProfileFields(fields)

    await this.profiledb.setProfileFields(encryptedFields)
    this._setLocalProfile({ ...this.profile, ...fields })
  }

  /**
   * create new profile with given fields in realm
   * @param fields
   * @returns {Promise<void>}
   * @private
   */
  async setNewProfileFields(fields: Profile): Promise<void> {
    const encryptedFields = await this._encryptProfileFields(fields)

    await this.profiledb.setProfile(encryptedFields)
    this._setLocalProfile({ ...this.profile, ...fields })
  }

  /**
   * helper to set display field based on privacy setting
   * @param field
   * @param value
   * @param privacy
   * @returns {*}
   * @private
   */
  _setDisplayFieldBasedOnPrivacy(field: string, value: string, privacy: string): string {
    let display

    switch (privacy) {
      case 'private':
        display = '******'
        break
      case 'masked':
        display = maskField(field, value)
        break
      case 'public':
        display = value
        break
      default:
        throw new Error('Invalid privacy setting', { privacy })
    }

    return display
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
  ): Promise<void> {
    const display = this._setDisplayFieldBasedOnPrivacy(field, value, privacy)
    logger.debug('setProfileField', { field, value, privacy, onlyPrivacy, display })
    return this.setProfileFields({ [field]: { value, display, privacy } })
  }

  /**
   * Avatar setter
   * @returns {Promise<CID[]>}
   */
  async setAvatar(avatar): Promise<CID[]> {
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
  async removeAvatar(): Promise<void> {
    await Promise.all(
      // eslint-disable-next-line require-await
      ['avatar', 'smallAvatar'].map(async field => this.setProfileFields({ [field]: null })),
    )
  }

  /**
   * store Avatar
   * @param avatarDataUrl
   * @returns {Promise<{ avatar: CID, smallAvatar: CID }>}
   */
  async _resizeAndStoreAvatars(avatarDataUrl: string): Promise<{ avatar: string, smallAvatar: string }> {
    let resizedDataUrl
    const avatarSizes = [AVATAR_SIZE, SMALL_AVATAR_SIZE]

    const resizedAvatars = await Promise.all(
      avatarSizes.map(async size => {
        resizedDataUrl = await resizeImage(resizedDataUrl || avatarDataUrl, size)

        return resizedDataUrl
      }),
    )

    // TODO: replace via IPFS.store() call once #3370 will be merged
    const [avatar, smallAvatar] = await Promise.all(
      // eslint-disable-next-line require-await
      resizedAvatars.map(async dataUrl => IPFS.store(dataUrl)),
    )

    return { avatar, smallAvatar }
  }

  /**
   * get another user public profile by wallet address
   * @param {*} walletAddress
   * @returns
   */
  getProfileByWalletAddress(walletAddress: string): Promise<any> {
    return this.getProfileByField('walletAddress', walletAddress)
  }

  getProfileByField(field: string, value: string): Promise<any> {
    return this.profiledb.getProfileBy({ [`${field}.display`]: value })
  }

  //TODO: need to save hashed walletAddress to index and make it unique in realmdb
  //TODO: in the future it should also validate the index.field.proof
  getProfilesByHashIndex(field: string, value: string): Promise<any> {
    return this.profiledb.getProfilesBy({ [`index.${field}.value`]: value })
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

    const publicProfile = Object.keys(rawProfile)
      .filter(key => rawProfile[key].privacy !== 'private')
      .reduce(
        (acc, currKey) => ({
          ...acc,
          [currKey]: rawProfile[currKey].display,
        }),
        {},
      )

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

    const fields = Object.keys(profile).filter(prop => this.indexableFields[prop])

    const validatedFields = await Promise.all(
      fields.map(async field => ({
        field,
        valid: await isValidValue(field, profile[field], true),
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

  setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<void> {
    const value = this.getProfileFieldValue(field)
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
    if (profile == null) {
      logger.warn(`getUserProfile: by field <${field}> empty result`)
      return { name: undefined, avatar: undefined }
    }
    const { fullName, smallAvatar } = profile

    logger.info(`getUserProfile by field <${field}>`, { fullName })

    return { name: fullName, avatar: smallAvatar }
  }

  /**
   * Delete profile
   * @returns {Promise<[Promise<void>, Promise<*>]>}
   */
  async deleteProfile(): Promise<boolean> {
    await this.profiledb.deleteProfile()
    this._setLocalProfile({})
  }
}
