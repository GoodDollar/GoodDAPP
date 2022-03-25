//@flow
import { default as goodWallet } from '../wallet/GoodWallet'
import getDB from '../realmdb/RealmDB'
import { ThreadDB } from '../textile/ThreadDB'
import { UserStorage } from './UserStorageClass'
import UserProperties from './UserProperties'

const db = getDB()

const userStorage = new UserStorage(goodWallet, db, new UserProperties(db))
global.userStorage = userStorage

export interface DB {
  init(db: ThreadDB): void;
  write(feeditem): Promise<void>;
  read(id: string): Promise<any>;
  readByPaymentId(paymentId: string): Promise<any>;
  encryptSettings(settings: object): Promise<any>;
  decryptSettings(): Promise<object>;
  getFeedPage(numResults, offset, filterCallback): Promise<Array<object>>;
}

export default userStorage
