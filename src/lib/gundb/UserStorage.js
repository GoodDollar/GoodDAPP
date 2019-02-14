//@flow
import { default as goodWallet, GoodWallet } from '../wallet/GoodWallet'
import pino from '../logger/pino-logger'

const logger = pino.child({ from: 'UserStorage' })
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
    logger.debug('Initializing GunDB UserStorage')
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
          logger.debug('GunDB logged in', { profile: this.profile, user, username, pubkey: this.wallet.account })
          // this.profile = user.get('profile')
        })
        .catch(e => {
          logger.error("GunDB can't login!", e)
        })
    })
  }
}

export default new UserStorage()
