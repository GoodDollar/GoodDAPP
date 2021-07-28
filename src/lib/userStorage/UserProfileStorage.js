// @flow
import { get, isFunction } from 'lodash'
import { getUserModel } from '../gundb/UserModel'
import type { UserModel } from '../gundb/UserModel'

/**
 * User's profile field data
 */
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy,
}

export interface ProfileDB {
  updateFields({}): Promise<void>;
  getProfile(): Promise<void>;
}

export interface ProfileStorage {
  setProfileFields({ fields: { key: String, field: ProfileField } }): Promise<void>;
}

export class UserProfileStorage {
  constructor(wallet: GoodWallet, profiledb: ProfileDB | ProfileStorage) {
    // const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    // this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    this.wallet = wallet
    this.profiledb = profiledb
    this.init()
  }

  init() {
    this.user = this.profiledb.user
  }

  //TODO:  make sure profile contains walletaddress or enforce it in schema in realmdb
  setProfile(profile) {
    this.profiledb.Profiles.updateOne(
      { user_id: this.user.id },
      { user_id: this.profiledb.user.id, ...profile },
      { upsert: true },
    )
  }

  getProfile() {
    return this.profiledb.Profiles.findOne({ user_id: this.profiledb.user.id })
  }

  getProfileByWalletAddress(walletAddress: string) {
    return this.profiledb.Profiles.findOne({ walletAddress })
  }

  setProfileFields(fields: { key: String, field: ProfileField }) {
    return this.profiledb.Profiles.updateOne({ user_id: this.profiledb.user.id }, { $set: fields })
  }

  removeAvatar(withCleanup?: boolean) {
    // eslint-disable-next-line require-await
    const updateRealmDB = async () => this.setProfileFields({ avatar: null })
    if (withCleanup !== true) {
      return updateRealmDB()
    }
    return this.setProfileFields({ avatar: null })
  }

  _storeAvatar(field: string, avatar: string, withCleanup = false) {
    // eslint-disable-next-line require-await
    const updateRealmDB = async () => this.setProfileFields({ [field]: avatar })
    if (withCleanup !== true) {
      return updateRealmDB()
    }

    return this.setProfileFields({ [field]: avatar })
  }

  async _removeBase64(field: string, updateGUNCallback = null) {
    if (isFunction(updateGUNCallback)) {
      await updateGUNCallback()
    }
  }

  initProfile() {}

  getProfileFieldValue(field: string) {
    return this.getProfile().then(data => data[field].value)
  }

  getProfileFieldDisplayValue(field: string) {
    return this.getProfile().then(data => data[field].display)
  }

  getProfileField(field: string) {
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

  getFieldPrivacy(field: string) {
    return this.getProfile().then(data => data[field].privacy)
  }

  validateProfile(profile: any): Promise<{ isValid: boolean, errors: {} }> {
    if (!profile) {
      return { isValid: false, errors: {} }
    }
  }

  async setProfileFieldPrivacy(field: string, privacy: FieldPrivacy) {
    let value = await this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy, true)
  }

  isUsername(username: string): Promise<boolean> {}

  getUserProfile(field?: string): { name: string, avatar: string } {}

  deleteProfile(): Promise<boolean> {}
}
