//@flow
import { default as goodWallet, GoodWallet } from '../wallet/GoodWallet'
import logger from '../logger/pino-logger'
import initGunDB from './gundb'

export type GunDBUser = {
  alias: string,
  epub: string,
  pub: string
}
class UserStorage {
  wallet: GoodWallet
  profile: any
  user: GunDBUser

  constructor() {
    this.wallet = goodWallet
    this.wallet.ready.then(() => this.init())
  }

  async init() {
    logger.level = 'trace'
    logger.info('Initializing GunDB UserStorage')
    initGunDB()
    const username = await this.wallet.sign('GoodDollarUser')
    const password = await this.wallet.sign('GoodDollarPass')
    const gunuser = global.gun.user()
    gunuser.create(username, password, async res => {
      await gunuser
        .auth(username, password)
        .then(user => {
          this.user = user
          this.profile = gunuser.get('profile')
          logger.info('GunDB logged in', { profile: this.profile, user, username, pubkey: this.wallet.account })
          // this.profile = user.get('profile')
        })
        .catch(e => {
          logger.error("GunDB can't login!", e)
        })
    })
  }
}

export default new UserStorage()
