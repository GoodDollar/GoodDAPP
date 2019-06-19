//@flow
import Gun from '@gooddollar/gun-appendonly'
import SEA from 'gun/sea'
import find from 'lodash/find'
import merge from 'lodash/merge'
import orderBy from 'lodash/orderBy'
import toPairs from 'lodash/toPairs'
import takeWhile from 'lodash/takeWhile'
import isEqual from 'lodash/isEqual'
import maxBy from 'lodash/maxBy'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import values from 'lodash/values'
import keys from 'lodash/keys'
import isEmail from 'validator/lib/isEmail'
import { AsyncStorage } from 'react-native'
import { default as goodWallet, type GoodWallet } from '../wallet/GoodWallet'
import isMobilePhone from '../validators/isMobilePhone'

import pino from '../logger/pino-logger'
import type { StandardFeed } from '../undux/GDStore'
import API from '../API/api'
import { getUserModel, type UserModel } from './UserModel'
import defaultGun from './gundb'
const logger = pino.child({ from: 'UserStorage' })

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

/**
 * User details returned from Gun SEA
 */
export type GunDBUser = {
  alias: string,
  epub: string,
  pub: string,
  sea: any
}

/**
 * possible privacy level for profile fields
 */
type FieldPrivacy = 'private' | 'public' | 'masked'

type ACK = {
  ok: number,
  err: string
}
type EncryptedField = any

/**
 * User's profile field data
 */
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy
}

/**
 * User's feed event data
 */
export type FeedEvent = {
  id: string,
  type: string,
  date: string,
  data: any
}

/**
 * Blockchain transaction event data
 */
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
 * Extracts transfer events sent to the current account
 * @param {object} receipt - Receipt event
 * @returns {object} {transferLog: event: [{evtName: evtValue}]}
 */
export const getReceiveDataFromReceipt = (receipt: any) => {
  if (!receipt || !receipt.logs || receipt.logs.length <= 0) {
    return {}
  }

  // Obtain logged data from receipt event
  const logs = receipt.logs
    .filter(_ => _)
    .map(log =>
      log.events.reduce(
        (acc, curr) => {
          return { ...acc, [curr.name]: curr.value }
        },
        { name: log.name }
      )
    )

  //maxBy is used in case transaction also paid a TX fee/burn, so since they are small
  //it filters them out
  const transferLog = maxBy(
    logs.filter(log => {
      return log && log.name === 'Transfer'
    }),
    'value'
  )
  const withdrawLog = logs.find(log => {
    return log && log.name === 'PaymentWithdraw'
  })
  logger.debug('getReceiveDataFromReceipt', { logs: receipt.logs, transferLog, withdrawLog })
  const log = withdrawLog || transferLog
  return log
}

export const getOperationType = (data: any, account: string) => {
  const EVENT_TYPES = {
    PaymentWithdraw: 'withdraw'
  }

  const operationType = data.from && data.from.toLowerCase() === account ? 'send' : 'receive'
  return EVENT_TYPES[data.name] || operationType
}

/**
 * Users gundb to handle user storage.
 * User storage is used to keep the user Self Soverign Profile and his blockchain transcation history
 * @class
 *  */
export class UserStorage {
  /**
   * wallet an instance of GoodWallet
   * @instance {GoodWallet}
   */
  wallet: GoodWallet

  /**
   * a gun node refering to gun.user()
   * @instance {Gun}
   */
  gunuser: Gun

  /**
   * a gun node referring to gun
   * @instance {Gun}
   */
  gun: Gun

  /**
   * a gun node refering to gun.user().get('profile')
   * @instance {Gun}
   */
  profile: Gun

  /**
   * a gun node refering to gun.user().get('feed')
   * @instance {Gun}
   */
  feed: Gun

  /**
   * In memory array. keep number of events per day
   * @instance {Gun}
   */
  feedIndex: Array<[Date, number]>

  /**
   * object with Gun SEA user details
   * @instance {GunDBUser}
   */
  user: GunDBUser

  /**
   * A promise which is resolved once init() is done
   */
  ready: Promise<boolean>

  subscribersProfileUpdates = []

  _lastProfileUpdate: any

  static indexableFields = {
    email: true,
    mobile: true,
    phone: true,
    walletAddress: true,
    username: true
  }

  /**
   * Clean string removing blank spaces and special characters, and converts to lower case
   *
   * @param {string} field - Field name
   * @param {string} value - Field value
   * @returns {string} - Value without '+' (plus), '-' (minus), '_' (underscore), ' ' (space), in lower case
   */
  static cleanFieldForIndex = (field: string, value: string): string => {
    if (!value) {
      return value
    }
    if (field === 'mobile' || field === 'phone') {
      return value.replace(/[_+-\s]+/g, '')
    }
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

  constructor(wallet: GoodWallet, gun: Gun = defaultGun) {
    this.gun = gun
    this.wallet = wallet || goodWallet
    this.ready = this.wallet.ready
      .then(() => this.init())
      .catch(e => {
        logger.error('Error initializing UserStorage', { e, message: e.message, account: this.wallet.account })
        return false
      })
  }

  /**
   * Initialize wallet, gundb user, feed and subscribe to events
   */
  async init() {
    logger.debug('Initializing GunDB UserStorage')

    //sign with different address so its not connected to main user address and there's no 1-1 link
    const username = await this.wallet.sign('GoodDollarUser', 'gundb').then(r => r.slice(0, 20))
    const password = await this.wallet.sign('GoodDollarPass', 'gundb').then(r => r.slice(0, 20))
    this.gunuser = this.gun.user()
    return new Promise((res, rej) => {
      this.gunuser.create(username, password, userCreated => {
        logger.debug('gundb user created', userCreated)

        //auth.then - doesnt seem to work server side in tests
        this.gunuser.auth(username, password, user => {
          if (user.err) {
            return rej(user.err)
          }
          this.user = this.gunuser.is
          this.profile = this.gunuser.get('profile')
          this.profile.open(doc => {
            this._lastProfileUpdate = doc
            this.subscribersProfileUpdates.forEach(callback => callback(doc))
          })
          logger.debug('init to events')

          this.initFeed()

          //save ref to user
          this.gun
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
          this.wallet.subscribeToEvent('receiptUpdated', receipt => this.handleReceiptUpdated(receipt))
          this.wallet.subscribeToEvent('receiptReceived', receipt => this.handleReceiptUpdated(receipt))
          res(true)
        })
      })
    })
  }

  async handleReceiptUpdated(receipt: any): Promise<FeedEvent> {
    try {
      const data = getReceiveDataFromReceipt(receipt)

      //get initial TX data
      const initialEvent = (await this.peekTX(receipt.transactionHash)) || { data: {} }

      //get existing or make a new event
      const feedEvent = (await this.getFeedItemByTransactionHash(receipt.transactionHash)) || {
        id: receipt.transactionHash,
        date: new Date().toString(),
        type: getOperationType(data, this.wallet.account)
      }

      //merge incoming receipt data into existing event
      const updatedFeedEvent: FeedEvent = {
        ...feedEvent,
        ...initialEvent,
        data: {
          ...feedEvent.data,
          ...data,
          ...initialEvent.data,
          receipt
        }
      }
      logger.debug('receiptReceived', { initialEvent, feedEvent, receipt, data, updatedFeedEvent })
      if (isEqual(feedEvent, updatedFeedEvent) === false) {
        await this.updateFeedEvent(updatedFeedEvent)
      }

      //remove pending once we used it and updated feed
      this.dequeueTX(receipt.transactionHash)
      return updatedFeedEvent
    } catch (error) {
      logger.error('handleReceiptUpdated', error)
    }
  }

  sign(msg: any) {
    return SEA.sign(msg, this.gunuser.pair())
  }

  /**
   * Find feed by transaction hash in array, and returns feed object
   *
   * @param {string} transactionHash - transaction identifier
   * @returns {object} feed item or null if it doesn't exist
   */
  async getFeedItemByTransactionHash(transactionHash: string): Promise<FeedEvent> {
    let feedItem = await this.feed
      .get('byid')
      .get(transactionHash)
      .decrypt()
      .catch(e => {
        logger.warn('getFeedItemByTransactionHash not found or cant decrypt', { transactionHash })
        return undefined
      })

    return feedItem
  }

  /**
   * Returns a Promise that, when resolved, will have all the feeds available for the current user
   * @returns {Promise<Array<FeedEvent>>}
   */
  async getAllFeed() {
    const total = values((await this.feed.get('index').then()) || {}).reduce((acc, curr) => acc + curr, 0)
    const prevCursor = this.cursor
    logger.debug('getAllFeed', { total, prevCursor })
    const feed = await this.getFeedPage(total, true)
    this.cursor = prevCursor
    logger.debug('getAllfeed', { feed, cursor: this.cursor })
    return feed
  }

  /**
   * Used as subscripition callback for gundb
   * When the index of <day> to <number of events> changes
   * We get the object and turn it into a sorted array by <day> which we keep in memory for feed display purposes
   * @param {object} changed the index data from gundb an object with days as keys and number of event in that day as value
   * @param {string} field the name of the gundb key changed
   */
  updateFeedIndex = (changed: any, field: string) => {
    if (field !== 'index' || changed === undefined) {
      return
    }
    delete changed._
    this.feedIndex = orderBy(toPairs(changed), day => day[0], 'desc')
    logger.debug('updateFeedIndex', { changed, field, newIndex: this.feedIndex })
  }

  /**
   * Subscribes to changes on the event index of day to number of events
   * the "false" (see gundb docs) passed is so we get the complete 'index' on every change and not just the day that changed
   */
  initFeed() {
    this.feed = this.gunuser.get('feed')
    this.feed.get('index').on(this.updateFeedIndex, false)
  }

  /**
   * Returns profile attribute
   *
   * @param {string} field - Profile attribute
   * @returns {Promise<ProfileField>} Decrypted profile value
   */
  getProfileFieldValue(field: string): Promise<ProfileField> {
    return this.profile
      .get(field)
      .get('value')
      .decrypt()
  }

  /**
   * Returns progfile attribute value
   *
   * @param {string} field - Profile attribute
   * @returns {Promise<ProfileField>} Gun profile attribute object
   */
  getProfileField(field: string): Promise<ProfileField> {
    return this.profile.get(field).then()
  }

  /**
   * Return display attribute of each profile property
   *
   * @param {object} profile - User profile
   * @returns {UserModel} - User model with display values
   */
  getDisplayProfile(profile: {}): UserModel {
    const displayProfile = Object.keys(profile).reduce(
      (acc, currKey) => ({ ...acc, [currKey]: profile[currKey].display }),
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
  getPrivateProfile(profile: {}): Promise<UserModel> {
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
    if (this._lastProfileUpdate) {
      callback(this._lastProfileUpdate)
    }
  }

  unSubscribeProfileUpdates() {
    this.subscribersProfileUpdates = []
  }

  /**
   * Save profile with all validations and indexes
   * It saves only known profile fields
   *
   * @param {UserModel} profile - User profile
   * @returns {Promise} Promise with profile settings updates and privacy validations
   * @throws Error if profile is invalid
   */
  setProfile(profile: UserModel) {
    if (profile && !profile.validate) {
      profile = getUserModel(profile)
    }
    const { errors, isValid } = profile.validate()
    if (!isValid) {
      logger.error('setProfile failed:', { errors })
      throw new Error(errors)
    }

    const profileSettings = {
      fullName: { defaultPrivacy: 'public' },
      email: { defaultPrivacy: 'public' },
      mobile: { defaultPrivacy: 'public' },
      avatar: { defaultPrivacy: 'public' },
      walletAddress: { defaultPrivacy: 'public' },
      username: { defaultPrivacy: 'public' }
    }
    const getPrivacy = async field => {
      const currentPrivacy = await this.profile.get(field).get('privacy')
      return currentPrivacy || profileSettings[field].defaultPrivacy || 'public'
    }
    return Promise.all(
      keys(profileSettings)
        .filter(key => profile[key])
        .map(async field => {
          return this.setProfileField(field, profile[field], await getPrivacy(field)).catch(e => {
            logger.error('setProfile field failed:', field)
            return { err: `failed saving field ${field}` }
          })
        })
    )
      .then(results => {
        const errors = results.filter(ack => ack && ack.err).map(ack => ack.err)
        if (errors.length > 0) {
          logger.error('setProfile some fields failed', errors.length, errors)
        }
        return true
      })
      .catch(e => logger.error('setProfile Failed', e, e.message))
  }

  /**
   * Set profile field with privacy settings
   *
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @returns {Promise} Promise with updated field value, secret, display and privacy.
   */
  async setProfileField(field: string, value: string, privacy: FieldPrivacy = 'public'): Promise<ACK> {
    let display
    switch (privacy) {
      case 'private':
        display = ''
        break
      case 'masked':
        display = UserStorage.maskField(field, value)

        //undo invalid masked field
        if (display === value) {
          privacy = 'public'
        }
        break
      case 'public':
        display = value
        break
      default:
        throw new Error('Invalid privacy setting', { privacy })
    }

    //for all privacy cases we go through the index, in case field was changed from public to private so we remove it
    if (UserStorage.indexableFields[field]) {
      const indexPromiseResult = await this.indexProfileField(field, value, privacy)
      logger.info('indexPromiseResult', indexPromiseResult)

      if (indexPromiseResult.err) {
        return indexPromiseResult
      }
    }

    return Promise.all([
      this.profile
        .get(field)
        .get('value')
        .secretAck(value),
      this.profile.get(field).putAck({
        display,
        privacy
      })
    ]).then(arr => arr[1])
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
    if (!UserStorage.indexableFields[field]) {
      return Promise.resolve({ err: 'Not indexable field', ok: 0 })
    }
    const cleanValue = UserStorage.cleanFieldForIndex(field, value)
    if (!cleanValue) {
      return Promise.resolve({ err: 'Indexable field cannot be null or empty', ok: 0 })
    }

    const indexNode = this.gun.get(`users/by${field}`).get(cleanValue)
    logger.debug('indexProfileField', { field, cleanValue, value, privacy })

    try {
      const indexValue = await indexNode.then()
      logger.debug('indexProfileField', {
        field,
        value,
        privacy,
        indexValue: indexValue,
        currentUser: this.gunuser.is.pub
      })
      if (indexValue && indexValue.pub !== this.gunuser.is.pub) {
        return Promise.resolve({ err: `Existing index on field ${field}`, ok: 0 })
      }
      if (privacy !== 'public' && indexValue !== undefined) {
        return indexNode.putAck(null)
      }

      const indexResult = indexNode.putAck(this.gunuser)

      // logger.info({ gunResult })
      return indexResult
    } catch (err) {
      logger.error('indexProfileField', err)
    }
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
    if (reset) {
      this.cursor = undefined
    }
    if (this.cursor === undefined) {
      this.cursor = 0
    }
    let total = 0
    if (!this.feedIndex) {
      return []
    }
    let daysToTake: Array<[string, number]> = takeWhile(this.feedIndex.slice(this.cursor), day => {
      if (total >= numResults) {
        return false
      }
      total += day[1]
      return true
    })
    this.cursor += daysToTake.length

    let promises: Array<Promise<Array<FeedEvent>>> = daysToTake.map(day => {
      return this.feed
        .get(day[0])
        .then()
        .catch(e => {
          logger.error('getFeed', e)
          return []
        })
    })

    const eventsIndex = flatten(await Promise.all(promises))

    return Promise.all(
      eventsIndex
        .filter(_ => _.id)
        .map(eventIndex =>
          this.feed
            .get('byid')
            .get(eventIndex.id)
            .decrypt()
        )
    )
  }

  /**
   * Return all feed events*
   * @returns {Promise} Promise with array of standarised feed events
   * @todo Add pagination
   */
  async getFormattedEvents(numResults: number, reset?: boolean): Promise<Array<StandardFeed>> {
    const feed = await this.getFeedPage(numResults, reset)
    logger.info('Kevin feed', feed.filter(feedItem => feedItem.data).map(feedItem => feedItem.data))
    return Promise.all(feed.filter(feedItem => feedItem.data).map(this.formatEvent))
  }

  async getFormatedEventById(id: string): Promise<StandardFeed> {
    const prevFeedEvent = (await this.getFeedItemByTransactionHash(id)) || (await this.peekTX(id))
    const standardPrevFeedEvent = await this.formatEvent(prevFeedEvent)
    if (!prevFeedEvent) {
      return standardPrevFeedEvent
    }
    if (prevFeedEvent.data && prevFeedEvent.data.receipt) {
      return standardPrevFeedEvent
    }

    //if for some reason we dont have the receipt(from blockchain) yet then fetch it
    const receipt = await this.wallet.getReceiptWithLogs(id)
    if (!receipt) {
      return standardPrevFeedEvent
    }

    //update the event
    let updatedEvent = await this.handleReceiptUpdated(receipt)
    logger.debug('getFormatedEventById updated event with receipt', { prevFeedEvent, updatedEvent })
    return this.formatEvent(updatedEvent)
  }

  /**
   *
   * @param {string} field - Profile field value (email, mobile or wallet address value)
   * @returns { string } address
   */
  getUserAddress(field: string) {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'
    const value = UserStorage.cleanFieldForIndex(attr, field)

    return this.gun
      .get(`users/by${attr}`)
      .get(value)
      .get('profile')
      .get('walletAddress')
      .get('display')
      .then()
  }

  /**
   * Returns name and avatar from profile based filtered by received value
   *
   * @param {string} field - Profile field value (email, mobile or wallet address value)
   * @returns {object} profile - { name, avatar }
   */
  async getUserProfile(field: string) {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'
    const value = UserStorage.cleanFieldForIndex(attr, field)

    const profileToShow = this.gun
      .get(`users/by${attr}`)
      .get(value)
      .get('profile')

    const avatar =
      (await profileToShow
        .get('avatar')
        .get('display')
        .then()) || undefined
    const name =
      (await profileToShow
        .get('fullName')
        .get('display')
        .then()) || 'Unknown Name'

    return { name, avatar }
  }

  /**
   * Returns the feed in a standard format to be loaded in feed list and modal
   *
   * @param {FeedEvent} param - Feed event with data, type, date and id props
   * @returns {Promise} Promise with StandardFeed object,
   *  with props { id, date, type, data: { amount, message, endpoint: { address, fullName, avatar, withdrawStatus }}}
   */
  async formatEvent({ data, type, date, id }: FeedEvent): Promise<StandardFeed> {
    const { receipt, from, to, sender, amount, reason, value, generatedString } = data
    let avatar, fullName, address, withdrawStatus
    if (receipt) {
      if (type === 'send') {
        address = to ? to.toLowerCase() : UserStorage.cleanFieldForIndex('walletAddress', receipt.to)
      } else {
        address = from ? from.toLowerCase() : UserStorage.cleanFieldForIndex('walletAddress', receipt.from)
      }
      const toType = isMobilePhone(address) ? 'mobile' : isEmail(address) ? 'email' : 'walletAddress'
      const searchField = `by${toType}`
      const profileToShow = this.gun
        .get(`users/${searchField}`)
        .get(address)
        .get('profile')

      fullName =
        (await profileToShow
          .get('fullName')
          .get('display')
          .then()) || (address === '0x0000000000000000000000000000000000000000' ? 'GoodDollar' : address)
      avatar =
        (await profileToShow
          .get('avatar')
          .get('display')
          .then()) || (fullName === 'GoodDollar' ? `${process.env.PUBLIC_URL}/favicon-96x96.png` : undefined)
    }

    if (generatedString) {
      withdrawStatus = await this.wallet.getWithdrawStatus(generatedString)
    }

    return {
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
  }

  /**
   * enqueue a new pending TX done on DAPP, to be later merged with the blockchain tx
   * the DAPP event can contain more details than the blockchain tx event
   * @param {FeedEvent} event
   * @returns {Promise<>}
   */
  enqueueTX(event: FeedEvent): Promise<> {
    return AsyncStorage.setItem(event.id, JSON.stringify(event))
  }

  /**
   * remove and return pending TX
   * @param eventId
   * @returns {Promise<FeedEvent>}
   */
  async dequeueTX(eventId: string): Promise<FeedEvent> {
    let res = await AsyncStorage.getItem(eventId)
    AsyncStorage.removeItem(eventId)
    return res ? JSON.parse(res) : res
  }

  /**
   * lookup a pending tx
   * @param {string} eventId
   * @returns {Promise<FeedEvent>}
   */
  async peekTX(eventId: string): Promise<FeedEvent> {
    let res = await AsyncStorage.getItem(eventId)
    return res ? JSON.parse(res) : res
  }

  /**
   * Update feed event
   *
   * @param {FeedEvent} event - Event to be updated
   * @returns {Promise} Promise with updated feed
   */
  async updateFeedEvent(event: FeedEvent): Promise<FeedEvent> {
    logger.debug('updateFeedEvent:', { event })
    let date = new Date(event.date)

    // force valid dates
    date = isValidDate(date) ? date : new Date()
    let day = `${date.toISOString().slice(0, 10)}`

    // Saving eventFeed by id
    logger.debug('updateFeedEvent starting encrypt')
    await this.feed
      .get('byid')
      .get(event.id)
      .secretAck(event)
      .catch(e => {
        logger.error('updateFeedEvent failedEncrypt byId:', e, event)
        return { err: e.message }
      })

    // Update dates index
    let dayEventsArr = (await this.feed.get(day).then()) || []
    let toUpd = find(dayEventsArr, e => e.id === event.id)
    const eventIndexItem = { id: event.id, updateDate: event.date }
    if (toUpd) {
      merge(toUpd, eventIndexItem)
    } else {
      let insertPos = dayEventsArr.findIndex(e => date > new Date(e.updateDate))
      if (insertPos >= 0) {
        dayEventsArr.splice(insertPos, 0, eventIndexItem)
      } else {
        dayEventsArr.unshift(eventIndexItem)
      }
    }
    let saveAck = this.feed
      .get(day)
      .putAck(JSON.stringify(dayEventsArr))
      .catch(err => logger.error('updateFeedEvent dayIndex', err))
    const ack = this.feed
      .get('index')
      .get(day)
      .putAck(dayEventsArr.length)
      .catch(err => logger.error('updateFeedEvent daySize', err))

    if (event.data && event.data.receipt) {
      await this.saveLastBlockNumber(event.data.receipt.blockNumber)
    }

    const result = await Promise.all([saveAck, ack])
      .then(arr => {
        return event
      })
      .catch(err => logger.error('savingIndex', err))
    return result
  }

  /**
   * Returns the 'lastBlock' gun's node
   * @returns {*}
   */
  getLastBlockNode() {
    return this.feed.get('lastBlock')
  }

  /**
   * Saves block number in the 'lastBlock' node
   * @param blockNumber
   * @returns {Promise<Promise<*>|Promise<R|*>>}
   */
  saveLastBlockNumber(blockNumber: number | string): Promise<any> {
    logger.debug('saving lastBlock:', blockNumber)
    return this.getLastBlockNode().putAck(blockNumber)
  }

  getProfile(): Promise<any> {
    return new Promise(res => {
      this.profile.load(async profile => res(await this.getPrivateProfile(profile)), { wait: 99 })
    })
  }

  /**
   * remove user from indexes when deleting profile
   */
  async deleteProfile(): Promise<boolean> {
    //first delete from indexes then delete the profile itself
    await Promise.all(
      keys(UserStorage.indexableFields).map(k => {
        return this.setProfileFieldPrivacy(k, 'private').catch(() => {
          logger.error('failed deleting profile field', k)
        })
      })
    )

    await this.gunuser
      .get('profile')
      .put('null')
      .then()

    return true
  }

  /**
   * Delete the user account.
   * Deleting gundb profile and clearing local storage
   * Calling the server to delete their data
   */
  async deleteAccount(): Promise<boolean> {
    let deleteResults = await Promise.all([
      goodWallet
        .deleteAccount()
        .then(r => ({ wallet: 'ok' }))
        .catch(e => ({ wallet: 'failed' })),
      API.deleteAccount(goodWallet.getAccountForType('zoomId'))
        .then(r => get(r, 'data.results'))
        .catch(e => ({
          server: 'failed'
        })),
      this.deleteProfile()
        .then(r => ({
          profile: 'ok'
        }))
        .catch(r => ({
          profile: 'failed'
        })),
      this.gunuser
        .get('feed')
        .put(null)
        .then(r => ({
          feed: 'ok'
        }))
        .catch(r => ({
          feed: 'failed'
        }))
    ])

    //Issue with gun delete()
    // let profileDelete = await this.gunuser
    //   .delete()
    //   .then(r => ({ profile: 'ok' }))
    //   .catch(e => ({
    //     profile: 'failed'
    //   }))
    logger.debug('deleteAccount', { deleteResults })
    return AsyncStorage.clear()
  }
}

const userStorage = new UserStorage()
global.userStorage = userStorage
export default userStorage
