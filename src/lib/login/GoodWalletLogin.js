// @flow
import type { Credentials } from '../API/api'
import { default as defaultWallet } from '../wallet/GoodWallet'
import logger from '../logger/pino-logger'
import { default as defaultStorage } from '../gundb/UserStorage'
import LoginService from './LoginService'
const log = logger.child({ from: 'GoodWalletLogin' })

export class GoodWalletLogin extends LoginService {
  wallet: GoodWallet

  constructor(wallet: GoodWallet = defaultWallet, userStorage = defaultStorage) {
    super()

    this.userStorage = userStorage
    this.wallet = wallet
  }

  async login(): Promise<Credentials> {
    const { toSign } = LoginService
    const { wallet, userStorage } = this
    const { networkId } = defaultWallet
    const { utils } = wallet.wallet

    const nonce = utils.randomHex(10).replace('0x', '')
    const message = toSign + nonce

    const signature = await this.wallet.sign(message, 'login')
    const gdSignature = await this.wallet.sign(message, 'gd')
    let profileSignature = null
    let profilePublickey = null

    if (userStorage) {
      profileSignature = await userStorage.sign(message)
      profilePublickey = userStorage.user.pub
    }

    const creds = {
      signature,
      gdSignature,
      profilePublickey,
      profileSignature,
      nonce,
      networkId,
    }

    log.info('returning creds', { creds })

    return creds
  }
}

export default new GoodWalletLogin(defaultWallet)
