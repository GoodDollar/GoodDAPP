//@flow
import { default as goodWallet, GoodWallet } from '../wallet/GoodWallet'
import pino from '../logger/pino-logger'
import { find, merge, orderBy, toPairs, takeWhile, flatten } from 'lodash'
const logger = pino.child({ from: 'UserStorage' })

const WAIT = 99
export type GunDBUser = {
  alias: string,
  epub: string,
  pub: string,
  sea: any
}

type FieldPrivacy = 'private' | 'public' | 'masked'
type ACK = {
  ok: string,
  err: string
}
type EncryptedField = any
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy
}
export type FeedEvent = {
  id: string,
  type: string,
  date: string,
  data: any
}

export type TransactionEvent = FeedEvent & {
  data: {
    to: string,
    reason: string,
    amount: number,
    sendLink: string,
    receipt: any
  }
}

class UserStorage {
  wallet: GoodWallet
  profile: Gun
  feed: Gun
  user: GunDBUser
  ready: Promise<boolean>

  static maskField = (fieldType: 'email' | 'mobile' | 'phone', value: string): string => {
    if (fieldType === 'email') {
      let parts = value.split('@')
      return `${parts[0][0]}${'*'.repeat(parts[0].length - 2)}${parts[0][parts[0].length - 1]}@${parts[1]}`
    }
    if (['mobile', 'phone'].includes(fieldType)) {
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
        return true
      })
  }

  async init() {
    logger.debug('Initializing GunDB UserStorage')
    //sign with different address so its not connected to main user address and there's no 1-1 link
    const username = await this.wallet.sign('GoodDollarUser', 'gundb')
    const password = await this.wallet.sign('GoodDollarPass', 'gundb')
    const gunuser = global.gun.user()
    return new Promise((res, rej) => {
      gunuser.create(username, password, async userCreated => {
        logger.debug('gundb user created', userCreated)
        //auth.then - doesnt seem to work server side in tests
        gunuser.auth(username, password, user => {
          this.user = user
          this.profile = gunuser.get('profile')
          this.initFeed()
          //save ref to user
          global.gun
            .get('users')
            .get(gunuser.is.pub)
            .put(gunuser)
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

  updateFeedIndex = (changed: any, field: string) => {
    if (field !== 'index' || changed === undefined) return
    delete changed._
    this.feedIndex = orderBy(toPairs(changed), day => day[0], 'desc')
  }
  async initFeed() {
    this.feed = global.gun.user().get('feed')
    await this.feed
      .get('index')
      .map()
      .once(this.updateFeedIndex)
      .then()
    this.feed.get('index').on(this.updateFeedIndex, false)
  }
  async getProfileFieldValue(field: string): Promise<any> {
    let pField: ProfileField = await this.profile
      .get(field)
      .get('value')
      .decrypt()
    return pField
  }

  async getProfileField(field: string): Promise<any> {
    let pField: ProfileField = await this.profile.get(field).then()
    return pField
  }

  async getDisplayProfile(profile: {}): Promise<any> {
    return Object.keys(profile).reduce((acc, currKey, arr) => ({ ...acc, [currKey]: profile[currKey].display }), {})
  }

  async getPrivateProfile(profile: {}) {
    const keys = Object.keys(profile)
    return Promise.all(keys.map(currKey => this.getProfileFieldValue(currKey))).then(values => {
      return values.reduce((acc, currValue, index) => {
        const currKey = keys[index]
        return { ...acc, [currKey]: currValue }
      }, {})
    })
  }

  getProfile(callback: any => void) {
    this.profile.open(
      doc => {
        callback(doc)
      },
      { wait: WAIT }
    )
  }

  async setProfile(profile: UserModel) {
    const { errors, isValid } = profile.validate()
    if (!isValid) {
      throw new Error(errors)
    }

    const profileSettings = {
      fullName: { defaultPrivacy: 'public' },
      email: { defaultPrivacy: 'masked' },
      mobile: { defaultPrivacy: 'masked' },
      avatar: { defaultPrivacy: 'public' }
    }

    const getPrivacy = async field => {
      const currentPrivacy = await this.profile.get(field).get('privacy')
      return currentPrivacy || profileSettings[field].defaultPrivacy
    }

    return Promise.all(
      Object.keys(profileSettings)
        .filter(key => profile[key])
        .map(async field => this.setProfileField(field, profile[field], await getPrivacy(field)))
    )
  }

  async setProfileField(field: string, value: string, privacy: FieldPrivacy): Promise<ACK> {
    let display
    switch (privacy) {
      case 'private':
        display = ''
        break
      case 'masked':
        display = UserStorage.maskField(field, value)
        //undo invalid masked field
        if (display === value) privacy = 'public'
        break
      default:
        display = value
    }
    // const encValue = await SEA.encrypt(value, this.user.sea)
    await this.profile
      .get(field)
      .get('value')
      .secret(value)
    return this.profile.get(field).putAck({
      display,
      privacy
    })
  }

  async setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK> {
    let value = await this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy)
  }

  /**
   * returns the next page in feed. could contain more than numResults. each page will contain all of the transactions
   * of the last day fetched even if > numResults
   * @param {number} numResults  return at least this number of results if available
   * @param {boolean} reset should restart cursor
   */
  async getFeedPage(numResults: number, reset?: boolean = false): Promise<Array<FeedEvent>> {
    if (reset) this.cursor = undefined
    if (this.cursor === undefined) this.cursor = 0
    let total = 0
    let daysToTake: Array<[string, number]> = takeWhile(this.feedIndex.slice(this.cursor), day => {
      if (total >= numResults) return false
      total += day[1]
      return true
    })
    this.cursor += daysToTake.length
    let promises: Array<Promise<Array<FeedEvent>>> = daysToTake.map(day => {
      return this.feed
        .get(day[0])
        .decrypt()
        .catch(e => {
          logger.error('getFeed', e)
          return []
        })
    })
    let results = flatten(await Promise.all(promises))
    return results
  }
  async updateFeedEvent(event: FeedEvent): Promise<ACK> {
    let date = new Date(event.date)
    let day = `${date.toISOString().slice(0, 10)}`
    let dayEventsArr: Array<FeedEvent> = (await this.feed.get(day).decrypt()) || []
    let toUpd = find(dayEventsArr, e => e.id === event.id)
    if (toUpd) {
      merge(toUpd, event)
    } else {
      let insertPos = dayEventsArr.findIndex(e => date > new Date(e.date))
      if (insertPos >= 0) dayEventsArr.splice(insertPos, 0, event)
      else dayEventsArr.unshift(event)
    }
    let saveAck = this.feed
      .get(day)
      .secretAck(dayEventsArr)
      .then({ ok: 0 })
      .catch(e => {
        return { err: e.message }
      })
    let ack = this.feed
      .get('index')
      .get(day)
      .putAck(dayEventsArr.length)
    return Promise.all([saveAck, ack]).then(arr => arr[0])
  }
}

export default new UserStorage()
