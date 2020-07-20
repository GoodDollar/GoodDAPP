// @flow
import type { Credentials } from '../API/api'
import { default as wallet } from '../wallet/GoodWallet'
import logger from '../logger/pino-logger'
import { default as defaultStorage } from '../gundb/UserStorage'
import LoginService from './LoginService'
const log = logger.child({ from: 'GoodWalletLogin' })

export class GoodWalletLogin extends LoginService {
  wallet: GoodWallet

  constructor(wallet: GoodWallet, userStorage = defaultStorage) {
    super()
    this.userStorage = userStorage
    this.wallet = wallet
  }

  async login(): Promise<Credentials> {
    const toSign = LoginService.toSign
    const nonce = this.wallet.wallet.utils.randomHex(10).replace('0x', '')
    const signature = await this.wallet.sign(toSign + nonce, 'login')
    const gdSignature = await this.wallet.sign(toSign + nonce, 'gd')
    const profileSignature = this.userStorage && (await this.userStorage.sign(LoginService.toSign + nonce))
    const profilePublickey = this.userStorage && this.userStorage.user.pub
    const creds = {
      signature,
      gdSignature,
      profilePublickey,
      profileSignature,
      nonce,
      networkId: wallet.networkId,
    }

    log.info('returning creds', { creds })

    return creds
  }
}

export default new GoodWalletLogin(wallet)
