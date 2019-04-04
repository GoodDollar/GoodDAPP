//@flow
import type { StandardFeed } from '../undux/GDStore'
import Gun from 'gun'
import SEA from 'gun/sea'
import { find, merge, orderBy, toPairs, takeWhile, flatten } from 'lodash'
import gun from './gundb'
import { default as goodWallet, type GoodWallet } from '../wallet/GoodWallet'

import pino from '../logger/pino-logger'
import { getUserModel, type UserModel } from './UserModel'

const logger = pino.child({ from: 'UserStorage' })

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

const getReceiveDataFromReceipt = (account, receipt) => {
  const transferLog = receipt.logs.find(log => {
    const { events } = log
    const eventIndex = events.findIndex(
      event => event.name === 'to' && event.value.toLowerCase() === account.toLowerCase()
    )
    logger.debug({ log, eventIndex, account })
    return eventIndex >= 0
  })
  logger.debug({ transferLog, account })
  return transferLog.events.reduce((acc, curr) => {
    return { ...acc, [curr.name]: curr.value }
  }, {})
}

class UserStorage {
  wallet: GoodWallet
  gunuser: Gun
  profile: Gun
  feed: Gun
  user: GunDBUser
  ready: Promise<boolean>
  subscribersProfileUpdates = []
  _lastProfileUpdate: any

  static indexableFields = {
    email: true,
    mobile: true,
    phone: true,
    walletAddress: true
  }
  static cleanFieldForIndex = (field: string, value: string): string => {
    if (field === 'mobile' || field === 'phone') return value.replace(/[_+-\s]+/g, '')
    return value
  }
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
    this.gunuser = gun.user()
    return new Promise((res, rej) => {
      this.gunuser.create(username, password, async userCreated => {
        logger.debug('gundb user created', userCreated)
        //auth.then - doesnt seem to work server side in tests
        this.gunuser.auth(username, password, user => {
          this.user = this.gunuser.is
          this.profile = this.gunuser.get('profile')
          this.profile.open(doc => {
            this._lastProfileUpdate = doc
            this.subscribersProfileUpdates.forEach(callback => callback(doc))
          })
          logger.debug('init to events')

          this.initFeed()
          //save ref to user
          gun
            .get('users')
            .get(this.gunuser.is.pub)
            .put(this.gunuser)
          logger.debug('GunDB logged in', { username, pubkey: this.wallet.account, user: this.user.sea })
          logger.debug('subscribing')

          this.wallet.subscribeToEvent('receive', (err, events) => {
            logger.debug({ err, events }, 'receive')
          })
          this.wallet.subscribeToEvent('send', (err, events) => {
            logger.debug({ err, events }, 'send')
          })
          this.wallet.subscribeToEvent('receiptUpdated', async receipt => {
            try {
              const feedEvent = await this.getFeedItemByTransactionHash(receipt.transactionHash)
              logger.debug('receiptUpdated', { feedEvent, receipt })
              if (!feedEvent) {
                logger.error('Received receipt with no event', receipt)
              }

              const updatedFeedEvent = { ...feedEvent, data: { ...feedEvent.data, receipt } }
              await this.updateFeedEvent(updatedFeedEvent)

              // Checking new feed
              const feed = await this.getAllFeed()
              logger.debug('receiptUpdated', { feed, receipt, updatedFeedEvent })
            } catch (error) {
              logger.error(error)
            }
          })
          logger.debug('web3', this.wallet.wallet)

          this.wallet.subscribeToEvent('receiptReceived', async receipt => {
            try {
              const data = getReceiveDataFromReceipt(this.wallet.account, receipt)
              logger.debug('receiptReceived', { receipt, data })
              const updatedFeedEvent = {
                id: receipt.transactionHash,
                date: new Date().toString(),
                type: 'receive',
                data: {
                  ...data,
                  receipt
                }
              }
              await this.updateFeedEvent(updatedFeedEvent)
              // Checking new feed
              const feed = await this.getAllFeed()
              logger.debug('receiptUpdated', { feed, receipt, updatedFeedEvent })
            } catch (error) {
              logger.error(error)
            }
          })
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

  async sign(msg: any) {
    return SEA.sign(msg, this.gunuser.pair())
  }

  async getFeedItemByTransactionHash(transactionHash: string) {
    const feed = await this.getAllFeed()
    logger.debug({ feed }, 'feed')
    const feedItem = feed.find(feedItem => feedItem.id === transactionHash)
    logger.debug({ feedItem })
    return feedItem
  }

  async getAllFeed() {
    const total = Object.values(await this.feed.get('index')).reduce((acc, curr) => acc + curr)
    logger.debug({ total })
    const feed = await this.getFeedPage(total, true)
    logger.debug({ feed })
    return feed
  }

  updateFeedIndex = (changed: any, field: string) => {
    if (field !== 'index' || changed === undefined) return
    delete changed._
    this.feedIndex = orderBy(toPairs(changed), day => day[0], 'desc')
  }

  async initFeed() {
    this.feed = this.gunuser.get('feed')
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
    const displayProfile = Object.keys(profile).reduce(
      (acc, currKey, arr) => ({ ...acc, [currKey]: profile[currKey].display }),
      {}
    )
    return getUserModel(displayProfile)
  }

  async getPrivateProfile(profile: {}) {
    const keys = Object.keys(profile)
    return Promise.all(keys.map(currKey => this.getProfileFieldValue(currKey)))
      .then(values => {
        return values.reduce((acc, currValue, index) => {
          const currKey = keys[index]
          return { ...acc, [currKey]: currValue }
        }, {})
      })
      .then(getUserModel)
  }

  subscribeProfileUpdates(callback: any => void) {
    this.subscribersProfileUpdates.push(callback)
    if (this._lastProfileUpdate) callback(this._lastProfileUpdate)
  }

  unSubscribeProfileUpdates() {
    this.subscribersProfileUpdates = []
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
      avatar: { defaultPrivacy: 'public' },
      walletAddress: { defaultPrivacy: 'public' }
    }

    const getPrivacy = async field => {
      const currentPrivacy = await this.profile.get(field).get('privacy')
      return currentPrivacy || profileSettings[field].defaultPrivacy || 'public'
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
    const indexPromiseResult = this.indexProfileField(field, value, privacy)
    await this.profile
      .get(field)
      .get('value')
      .secret(value)
    return this.profile.get(field).putAck({
      display,
      privacy
    })
  }

  //TODO: this is world writable so theoritically a malicious user could delete the indexes
  //need to develop for gundb immutable keys to non first user
  async indexProfileField(field: string, value: string, privacy: FieldPrivacy): Promise<ACK> {
    if (!UserStorage.indexableFields[field]) return
    const cleanValue = UserStorage.cleanFieldForIndex(field, value)
    if (privacy !== 'public')
      return gun
        .get('users')
        .get('by' + field)
        .get(cleanValue)
        .putAck(null)

    return gun
      .get('users')
      .get('by' + field)
      .get(cleanValue)
      .putAck(this.gunuser)
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
    if (!this.feedIndex) return []
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
    const stdResults = results.map(this.standardizeFeed)
    console.log('stdResults', stdResults)
    return results
  }

  async getStandardizedFeed(amount: number, reset: boolean): Promise<Array<StandardFeed>> {
    return (await this.getFeedPage(amount, reset)).map(this.standardizeFeed)
  }

  standardizeFeed(feed: FeedEvent): StandardFeed {
    const avatar =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII='
    const stdFeed = {
      id: feed.id,
      date: new Date(feed.date).getTime(),
      type: feed.type,
      data: {
        endpoint: {
          address: feed.data.sender,
          fullName: 'Misao Matimbo',
          avatar: avatar
        },
        amount: feed.data.amount,
        message: feed.data.reason || 'For the pizza'
      }
    }

    return stdFeed
  }

  async updateFeedEvent(event: FeedEvent): Promise<ACK> {
    logger.debug(event)

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

const userStorage = new UserStorage()
global.userStorage = userStorage
export default userStorage
