//@flow
import { default as goodWallet } from '../wallet/GoodWallet'
import { UserStorage } from './UserStorageClass'
import defaultGun from './gundb'

const userStorage = new UserStorage(goodWallet, defaultGun)
global.userStorage = userStorage

export default userStorage
