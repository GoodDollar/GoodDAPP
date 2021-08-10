//@flow
import { default as goodWallet } from '../wallet/GoodWallet'
import { UserStorage } from './UserStorageClass'

const userStorage = new UserStorage(goodWallet)

// global.userStorage = userStorage

export default userStorage
