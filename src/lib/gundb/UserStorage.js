//@flow
import { default as goodWallet, GoodWallet } from '../wallet/GoodWallet'
import SEA from 'gun/sea'
import pino from '../logger/pino-logger'

const logger = pino.child({ from: 'UserStorage' })

export type GunDBUser = {
  alias: string,
  epub: string,
  pub: string
}

type FieldPrivacy = 'private' | 'public' | 'masked'
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy
}
class UserStorage {
  wallet: GoodWallet
  profile: any
  user: GunDBUser
  ready: Promise<boolean>

  static maskField = (fieldType: 'email' | 'mobile' | 'phone', value: string): string => {
    if (fieldType === 'email') {
      let parts = value.split('@')
      return `${parts[0][0]}${'*'.repeat(parts[0].length - 2)}${parts[0][parts.length - 1]}@${parts[1]}`
    }
    if (fieldType === 'phone') {
      return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`
    }
    return value
  }
  constructor() {
    this.wallet = goodWallet
    this.ready = this.wallet.ready
      .then(() => this.init())
      .catch(e => {
        logger.error('Error initializing UserStorage', e)
      })
  }

  async init() {
    logger.debug('Initializing GunDB UserStorage')
    const username = await this.wallet.sign('GoodDollarUser')
    const password = await this.wallet.sign('GoodDollarPass')
    const gunuser = global.gun.user()
    return new Promise((res, rej) => {
      gunuser.create(username, password, async userCreated => {
        logger.debug('gundb user created', userCreated)
        gunuser.auth(username, password, user => {
          this.user = user
          this.profile = gunuser.get('profile')
          logger.debug('GunDB logged in', { username, pubkey: this.wallet.account, user: this.user.sea })
          res(true)
          // this.profile = user.get('profile')
        })
        // .catch(e => {
        //   console.log('arrrr')
        //   logger.error("GunDB can't login!", e)
        //   rej(false)
        // })
      })
    })
  }

  async getProfileField(field) {
    let pField: ProfileField = await this.profile
      .get(field)
      .get('value')
      .decrypt()
    return pField
  }

  async setProfileField(field: string, value: string, privacy: FieldPrivacy) {
    let display
    switch (privacy) {
      case 'private':
        display = ''
        break
      case 'masked':
        display = UserStorage.maskField(value)
        break
      default:
        display = value
    }
    // const encValue = await SEA.encrypt(value, this.user.sea)
    this.profile
      .get(field)
      .get('value')
      .secret(value)
    return this.profile
      .get(field)
      .put({
        display,
        privacy
      })
      .then()
  }
}

export default new UserStorage()
