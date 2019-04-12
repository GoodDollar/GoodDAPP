//@flow
import type { StandardFeed } from '../undux/GDStore'
import Gun from 'gun'
import SEA from 'gun/sea'
import { find, merge, orderBy, toPairs, takeWhile, flatten } from 'lodash'
import gun from './gundb'
import { default as goodWallet, type GoodWallet } from '../wallet/GoodWallet'
import isMobilePhone from '../validators/isMobilePhone'
import isEmail from 'validator/lib/isEmail'

import pino from '../logger/pino-logger'
import { getUserModel, type UserModel } from './UserModel'

const logger = pino.child({ from: 'UserStorage' })

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

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

/**
 * Obtain logged data from receipt event
 * @param {string} account - Wallet account
 * @param {object} receipt - Receipt event
 * @returns Transfer logs related to the receipt and the account
 */
const getReceiveDataFromReceipt = (account: string, receipt: any) => {
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

  /**
   * Clean string removing blank spaces and special characters, and converts to lower case
   *
   * @param {string} field - Field name
   * @param {string} value - Field value
   * @returns {string} - Value without '+' (plus), '-' (minus), '_' (underscore), ' ' (space), in lower case
   */
  static cleanFieldForIndex = (field: string, value: string): string => {
    if (field === 'mobile' || field === 'phone') return value.replace(/[_+-\s]+/g, '')
    return value.toLowerCase()
  }

  /**
   * Returns phone with last 4 numbers, and before that ***,
   * and hide email user characters leaving visible only first and last character
   * @param {string} fieldType - (Email, mobile or phone) Field name
   * @param {string} value - Field value
   * @returns {string} - Returns masked value with *** to hide characters
   */
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

  /**
   * Initialize wallet, gundb user, feed and subscribe to events
   */
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

  /**
   * Find feed by transaction hash in array, and returns feed object
   *
   * @param {string} transactionHash - transaction identifier
   * @returns {object} feed item or null if it doesn't exist
   */
  async getFeedItemByTransactionHash(transactionHash: string) {
    const feed = await this.getAllFeed()
    logger.debug({ feed }, 'feed')
    const feedItem = feed.find(feedItem => feedItem.id === transactionHash)
    logger.debug({ feedItem })
    return feedItem
  }

  /**
   * Returns all feeds without pagination
   * @returns {array} Feed list
   */
  async getAllFeed() {
    const total = Object.values((await this.feed.get('index')) || {}).reduce((acc, curr) => acc + curr, 0)
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

  /**
   * Returns profile attribute
   *
   * @param {string} field - Profile attribute
   * @returns {string} Decrypted profile value
   */
  async getProfileFieldValue(field: string): Promise<any> {
    let pField: ProfileField = await this.profile
      .get(field)
      .get('value')
      .decrypt()
    return pField
  }

  /**
   * Returns progfile attribute value
   *
   * @param {string} field - Profile attribute
   * @returns {Promise} Gun profile attribute object
   */
  async getProfileField(field: string): Promise<any> {
    let pField: ProfileField = await this.profile.get(field).then()
    return pField
  }

  /**
   * Return display attribute of each profile property
   *
   * @param {object} profile - User profile
   * @returns {object} - User model with display values
   */
  async getDisplayProfile(profile: {}): Promise<any> {
    const displayProfile = Object.keys(profile).reduce(
      (acc, currKey, arr) => ({ ...acc, [currKey]: profile[currKey].display }),
      {}
    )
    return getUserModel(displayProfile)
  }

  /**
   * Returns user model with attribute values
   *
   * @param {object} profile - user profile
   * @returns {object} UserModel with some inherit functions
   */
  async getPrivateProfile(profile: {}): UserModel {
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

  /**
   * Save profile with all validations and indexes
   *
   * @param {object} profile - User profile
   * @returns {Promise} Promise with profile settings updates and privacy validations
   * @throws Error if profile is invalid
   */
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

  /**
   * Set profile field with privacy settings
   *
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @returns {Promise} Promise with updated field value, secret, display and privacy.
   */
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

  /**
   * Generates index by field if privacy is public, or empty index if it's not public
   *
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @returns Gun result promise after index is generated
   * @todo This is world writable so theoritically a malicious user could delete the indexes
   * need to develop for gundb immutable keys to non first user
   */
  async indexProfileField(field: string, value: string, privacy: FieldPrivacy): Promise<ACK> {
    if (!UserStorage.indexableFields[field]) return
    const cleanValue = UserStorage.cleanFieldForIndex(field, value)

    logger.info({ field, value, privacy })
    if (privacy !== 'public')
      return gun
        .get('users')
        .get('by' + field)
        .get(cleanValue)
        .putAck(null)

    const gunResult = await gun
      .get('users')
      .get('by' + field)
      .get(cleanValue)
      .putAck(this.gunuser)

    logger.info({ gunResult })
    return gunResult
  }

  /**
   * Set profile field privacy.
   *
   * @param {string} field - Profile attribute
   * @param {string} privacy - (private | public | masked)
   * @returns {Promise} Promise with updated field value, secret, display and privacy.
   */
  async setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK> {
    let value = await this.getProfileFieldValue(field)
    return this.setProfileField(field, value, privacy)
  }

  /**
   * Returns the next page in feed. could contain more than numResults. each page will contain all of the transactions
   * of the last day fetched even if > numResults
   *
   * @param {number} numResults - return at least this number of results if available
   * @param {boolean} reset - should restart cursor
   * @returns {Promise} Promise with an array of feed events
   */
  async getFeedPage(numResults: number, reset?: boolean = false): Promise<Array<FeedEvent>> {
    logger.debug({ numResults, cursor: this.cursor })
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
    logger.debug({ results, daysToTake, cursor: this.cursor })
    // const stdResults = results.map(this.standardizeFeed)
    // console.log('stdResults', stdResults)
    return results
  }

  /**
   * Return all feed events
   *
   * @returns {Promise} Promise with array of standarised feed events
   * @todo Add pagination
   */
  async getStandardizedFeed(): Promise<Array<StandardFeed>> {
    const feed = await this.getAllFeed()
    return await Promise.all(feed.filter(feedItem => feedItem.data).map(this.standardizeFeed))
    // TODO: Use proper pagination
    // return (await this.getFeedPage(amount, true)).map(this.standardizeFeed)
  }

  /**
   * Returns the feed in a standard format to be loaded in feed list and modal
   *
   * @param {FeedEvent} param - Feed event with data, type, date and id props
   * @returns {Promise} Promise with StandardFeed object,
   *  with props { id, date, type, data: { amount, message, endpoint: { address, fullName, avatar, withdrawStatus }}}
   */
  async standardizeFeed({ data, type, date, id }: FeedEvent): Promise<StandardFeed> {
    const { receipt, from, to, sender, amount, reason, value, generatedString } = data
    let avatar, fullName, address, withdrawStatus
    if (receipt) {
      if (type === 'send') {
        address = to ? to.toLowerCase() : UserStorage.cleanFieldForIndex('walletAddress', receipt.to)
      } else {
        address = from ? from.toLowerCase() : UserStorage.cleanFieldForIndex('walletAddress', receipt.from)
      }

      const searchField = 'by' + (isMobilePhone(address) ? 'mobile' : isEmail(address) ? 'email' : 'walletAddress')
      gun.get('users').load(allUsers => logger.info({ allUsers }), { wait: 99 })
      const profileToShow = gun
        .get('users')
        .get(searchField)
        .get(address)
        .get('profile')

      avatar =
        (await profileToShow
          .get('avatar')
          .get('display')
          .then()) || undefined
      fullName =
        (await profileToShow
          .get('fullName')
          .get('display')
          .then()) || 'Unknown Name'
    }

    if (generatedString) {
      withdrawStatus = await this.wallet.getWithdrawStatus(generatedString)
    }

    const stdFeed = {
      id: id,
      date: new Date(date).getTime(),
      type: type,
      data: {
        endpoint: {
          address: sender,
          fullName,
          avatar,
          withdrawStatus
        },
        amount: amount || value,
        message: reason
      }
    }
    return stdFeed
  }

  /**
   * Update feed event
   *
   * @param {FeedEvent} event - Event to be updated
   * @returns {Promise} Promise with updated feed
   */
  async updateFeedEvent(event: FeedEvent): Promise<ACK> {
    logger.debug(event)

    let date = new Date(event.date)
    // force valid dates
    date = isValidDate(date) ? date : new Date()
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
