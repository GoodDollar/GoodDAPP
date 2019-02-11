// @flow
import LoginService from './LoginService'
import type { Credentials } from '../API/api'
import { default as wallet, GoodWallet } from '../wallet/GoodWallet'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'GoodWalletLogin' })

export class GoodWalletLogin extends LoginService {
  wallet: GoodWallet

  constructor(wallet: GoodWallet) {
    super()
    this.wallet = wallet
  }

  async login(): Promise<Credentials> {
    const toSign = 'Login to GoodDAPP'

    const signature = await this.wallet.sign(toSign)

    const creds = {
      publicKey: this.wallet.account,
      signature: signature,
      jwt: ''
    }

    log.info('returning creds', { creds })

    return creds
  }
}

export default new GoodWalletLogin(wallet)
