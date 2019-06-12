// @flow
import type { Credentials } from '../API/api'
import { GoodWallet, default as wallet } from '../wallet/GoodWallet'
import logger from '../logger/pino-logger'
import { default as defaultStorage } from '../gundb/UserStorage'
import LoginService from './LoginService'
const log = logger.child({ from: 'GoodWalletLogin' })

export class GoodWalletLogin extends LoginService {
  wallet: GoodWallet

  constructor(wallet: GoodWallet, userStorage = defaultStorage) {
    super(userStorage)
    this.wallet = wallet
  }

  async login(): Promise<Credentials> {
    const toSign = LoginService.toSign
    const nonce = this.wallet.wallet.utils.randomHex(10).replace('0x', '')
    const signature = await this.wallet.sign(toSign + nonce, 'login')
    const gdSignature = await this.wallet.sign(toSign + nonce, 'gd')

    const creds = {
      signature,
      gdSignature,
      nonce
    }

    log.info('returning creds', { creds })

    return creds
  }
}

export default new GoodWalletLogin(wallet)
