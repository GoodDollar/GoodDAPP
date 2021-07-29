//@flow
import { default as goodWallet } from '../wallet/GoodWallet'
import getDB from '../realmdb/RealmDB'
import { UserProfileStorage } from './UserProfileStorage'
import { UserStorage } from './UserStorageClass'
import UserProperties from './UserProperties'

const db = getDB()

const userStorage = new UserStorage(goodWallet, db, new UserProperties(db))
const storage = new UserProfileStorage(goodWallet, db, new UserProperties(db))
global.userStorage = userStorage
global.storage = storage

export interface DB {
  init(privateKey: string, publicKey: string): void;
  write(feeditem): Promise<void>;
  read(id: string): Promise<any>;
  readByPaymentId(paymentId: string): Promise<any>;
  encryptSettings(settings: object): Promise<any>;
  decryptSettings(): Promise<object>;
  getFeedPage(numResults, offset): Promise<Array<object>>;
}

export default userStorage
