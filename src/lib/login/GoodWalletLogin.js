// @flow
import { default as defaultWallet } from '../wallet/GoodWallet'
import { default as defaultStorage } from '../gundb/UserStorage'
import GoodWalletLogin from './GoodWalletLoginClass'

export default new GoodWalletLogin(defaultWallet, defaultStorage)
