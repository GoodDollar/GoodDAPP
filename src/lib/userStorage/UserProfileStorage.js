// @flow
import * as TextileCrypto from '@textile/crypto'
import { assign } from 'lodash'
import IPFS from '../ipfs/IpfsStorage'
import pino from '../logger/pino-logger'
import { isValidDataUrl } from '../utils/base64'
import { AVATAR_SIZE, resizeImage, SMALL_AVATAR_SIZE } from '../utils/image'
import isEmail from '../validators/isEmail'
import isMobilePhone from '../validators/isMobilePhone'
import type { UserModel } from './UserModel'
import { getUserModel } from './UserModel'
import type { FieldPrivacy, Profile, ProfileField } from './UserStorageClass'
import { cleanHashedFieldForIndex, isValidValue, maskField } from './utlis'

const logger = pino.child({ from: 'UserProfileStorage' })

export interface ProfileDB {
  setProfile(profile: Profile): Promise<void>;
  getProfile(): Promise<Profile>;
  getPublicProfile(key: string, field: string): Promise<Profile>;
  getProfilesBy(query: Object): Promise<Array<Profile>>;
  deleteProfile(): Promise<boolean>;
}

// private methods couldn't be a part of the interface
// by definition interface describes only public API
// so they have been removed
export interface ProfileStorage {
  init(): Promise<void>;
  setProfile(profile: UserModel): Promise<void>;
  getProfile(): { [key: string]: string };
  setProfileField(field: string, value: string, privacy: FieldPrivacy, onlyPrivacy: boolean): Promise<void>;
  setAvatar(avatar: string): Promise<void>;
  removeAvatar(): Promise<void>;
  getProfileByWalletAddress(walletAddress: string): Promise<Profile>;
  getPublicProfile(key: string, value: string): { name: string, avatar: string };
  getProfileFieldValue(field: string): string;
  getProfileFieldDisplayValue(field: string): string;
  getProfileField(field: string): ProfileField;
  getDisplayProfile(): UserModel;
  getPrivateProfile(): UserModel;
  getFieldPrivacy(field: string): string;
  validateProfile(profile: any): Promise<{ isValid: boolean, errors: {} }>;
  setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<void>;
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
    phone: true,
    username: true,
  }

  walletAddressIndex = {}

  //unecrypted profile field values
  profile: Profile = {}

  constructor(wallet: GoodWallet, profiledb: ProfileDB, privateKey: TextileCrypto.PrivateKey) {
    // const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    // this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    this.wallet = wallet
    this.profiledb = profiledb
    this.privateKey = privateKey
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
   * helper for decrypting items
   * @param {*} field
   * @returns
   */
  async _decryptField(field): Promise<string> {
    const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(field, 'base64')))
    return JSON.parse(new TextDecoder().decode(decrypted))
  }

  /**
   * helper for encrypting fields
   * @param field
   * @returns {Promise<*>}
   */
  async _encryptField(field): Promise<string> {
    try {
      const msg = new TextEncoder().encode(JSON.stringify(field))
      const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
      logger.debug('encrypt result:', { field: encrypted })
      return encrypted
    } catch (e) {
      logger.error('error encryptField field:', e.message, e, { field })
    }
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
            value: await this._decryptField(profile[item]?.value).catch(e => {
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
      Object.keys(profile).map(async field => {
        //only encrypt fields with .value format ie(ProfileField)
        if (profile[field]?.value) {
          return (encryptProfile[field] = {
            ...profile[field],
            value: await this._encryptField(profile[field]?.value),
          })
        }

        //non encrypted fields
        encryptProfile[field] = profile[field]
      }),
    )

    return encryptProfile
  }

  /**
   * saves a complete profile to the underlying storage
   * @param {*} profile
   * @param update
   */
  async setProfile(profile: UserModel, update: boolean = false): Promise<void> {
    if (!update) {
      //inject walletaddress field for new profile
      profile.walletAddress = this.wallet.account
    }

    const fields = Object.keys(profile).filter(prop => this.profileSettings[prop])

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
      const index = {
        walletAddress: {
          hash: cleanHashedFieldForIndex('walletAddress', this.wallet.account),
          proof: await this.wallet.sign(cleanHashedFieldForIndex('walletAddress', this.wallet.account)),
        },
      }
      logger.debug('setProfile new:', { fields, profile, fieldsToSave, index })

      return this._setProfileFields({ ...fieldsToSave, index, publicKey: this.privateKey.public.toString() })
    }

    return this._setProfileFields(fieldsToSave)
  }

  /**
   * gets the current unencrypted field values in-memory
   * @returns
   */
  getProfile(): { [key: string]: string } {
    return this.profile
  }

  /**
   * updates profile fields in realm
   * @param {*} fields
   * @returns
   */
  async _setProfileFields(fields: Profile): Promise<void> {
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
    return this._setProfileFields({ [field]: { value, display, privacy } })
  }

  /**
   * Avatar setter
   * @returns {Promise<CID[]>}
   */
  async setAvatar(avatar): Promise<CID[]> {
    const cids = await this._resizeAndStoreAvatars(avatar)
    return this.setProfile(cids, true)
  }

  /**
   * remove Avatar from profile
   * @returns {Promise<[Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>]>}
   */
  // eslint-disable-next-line require-await
  async removeAvatar(): Promise<void> {
    return this._setProfileFields({ avatar: null, smallAvatar: null })
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
    return this.getPublicProfile('walletAddress', walletAddress)
  }

  //TODO: in the future it should also validate the index.field.proof
  getProfilesByHashIndex(field: string, value: string): Promise<any> {
    const hashed = cleanHashedFieldForIndex(field, value)
    return this.profiledb.getProfilesBy({ [`index.${field}.hash`]: hashed })
  }

  /**
   * helper to get a user public profile by key/value
   * @param field
   * @param {*} value
   */
  async getPublicProfile(field: string, value?: string): Promise<{ [field: string]: string }> {
    let attr, profiles

    if (!value) {
      attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'
      profiles = await this.getProfilesByHashIndex(attr, field)
    } else {
      profiles = await this.getProfilesByHashIndex(field, value)
    }

    if (!profiles?.length) {
      logger.warn(`getPublicProfile: by field <${field}> and  value <${value}> empty result`)
      return null
    }
    const rawProfile = profiles[0]
    const publicProfile = Object.keys(rawProfile)
      .filter(key => rawProfile[key] && rawProfile[key].privacy !== 'private')
      .reduce(
        (acc, currKey) => ({
          ...acc,
          [currKey]: rawProfile[currKey].display || rawProfile[currKey],
        }),
        {},
      )

    const { fullName } = publicProfile

    logger.info(`getPublicProfile by field <${field}>`, { fullName })

    return publicProfile
  }

  /**
   * Returns ProfileField value. It may be encrypted
   * @param field
   * @returns {EncryptedField}
   */
  getProfileFieldValue(field: string): string {
    return this.profile[field]?.value
  }

  /**
   * Returns profile field display value
   * @param field
   * @returns {string}
   */
  getProfileFieldDisplayValue(field: string): string {
    return this.profile[field]?.display
  }

  /**
   * Returns ProfileField
   * @param field
   * @returns {ProfileField}
   */
  getProfileField(field: string): ProfileField {
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

  /**
   * Returns field privacy
   * @param field
   * @returns {FieldPrivacy}
   */
  getFieldPrivacy(field: string): FieldPrivacy {
    const currentPrivacy = this.profile[field]?.privacy

    return currentPrivacy || this.profileSettings[field].defaultPrivacy || 'public'
  }

  /**
   * Checks if profile is valid profile
   * @param profile
   * @returns {Promise<{isValid: boolean, errors: {}}|{isValid, errors}>}
   */
  async validateProfile(profile: Profile): Promise<{ isValid: boolean, errors: {} }> {
    if (!profile) {
      return { isValid: false, errors: {} }
    }

    const fields = Object.keys(profile).filter(prop => this.indexableFields[prop])

    const validatedFields = await Promise.all(
      fields.map(async field => ({
        field,
        valid: await isValidValue(field, profile[field]),
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

  /**
   * Set only profile field privacy
   * @param field
   * @param privacy
   * @returns {Promise<void>}
   */
  setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<void> {
    const value = this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy, true)
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
