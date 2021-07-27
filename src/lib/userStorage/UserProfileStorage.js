// @flow
/**
 * User's profile field data
 */
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy,
}

export interface ProfileDB {
  updateField(name: string, field: ProfileField): Promise<void>;
  getProfileBy(field: String, value: string): Promise<void>;
}

// export interface ProfileStorage {
//     setProfileField
// }

// class UserProfileStorage:ProfileStorage {
//   constructor(wallet: GoodWallet, profiledb: ProfileDB) {
//     const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
//     this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
//   }
// }
