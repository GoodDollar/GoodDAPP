// @flow
import type { Credentials } from '../API/api'
import logger from '../logger/pino-logger'
import LoginService from './LoginService'

const log = logger.child({ from: 'GoodWalletLogin' })

class GoodWalletLogin extends LoginService {
  wallet: GoodWallet

  constructor(wallet: GoodWallet, userStorage) {
    super()

    this.userStorage = userStorage
    this.wallet = wallet
  }

  async login(): Promise<Credentials> {
    const { toSign } = LoginService
    const { wallet } = this
    const { networkId } = wallet
    const { utils } = wallet.wallet

    const nonce = utils.randomHex(10).replace('0x', '')
    const message = toSign + nonce

    const signature = await wallet.sign(message, 'login')
    const gdSignature = await wallet.sign(message, 'gd')

    const creds = {
      signature,
      gdSignature,
      nonce,
      networkId,
    }

    log.info('returning creds', { creds })

    return creds
  }
}

export default GoodWalletLogin
