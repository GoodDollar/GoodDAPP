//@flow
import { default as goodWallet } from '../wallet/GoodWallet'
import getDB from '../realmdb/FeedDB'
import { UserStorage } from './UserStorageClass'
import UserProperties from './UserProperties'

const db = getDB()
const userStorage = new UserStorage(goodWallet, db, new UserProperties(db))
global.userStorage = userStorage

export default userStorage
