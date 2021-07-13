// @flow
import { default as defaultWallet } from '../wallet/GoodWallet'
import { default as defaultStorage } from '../userStorage/UserStorage'
import GoodWalletLogin from './GoodWalletLoginClass'

export default new GoodWalletLogin(defaultWallet, defaultStorage)
