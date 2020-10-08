//@flow
import Mutex from 'await-mutex'
import { Platform } from 'react-native'
import {
  debounce,
  filter,
  find,
  flatten,
  get,
  isEqual,
  isError,
  isString,
  isUndefined,
  keys,
  maxBy,
  memoize,
  merge,
  noop,
  omit,
  orderBy,
  over,
  some,
  takeWhile,
  toPairs,
  uniqBy,
  values,
} from 'lodash'
import isEmail from 'validator/lib/isEmail'
import moment from 'moment'
import Gun from '@gooddollar/gun'
import SEA from '@gooddollar/gun/sea'
import { gunAuth as gunPKAuth } from '@gooddollar/gun-pk-auth'
import { sha3 } from 'web3-utils'
import EventEmitter from 'eventemitter3'

import AsyncStorage from '../../lib/utils/asyncStorage'
import { retry } from '../utils/async'

import FaceVerificationAPI from '../../components/dashboard/FaceVerification/api/FaceVerificationApi'
import Config from '../../config/config'
import API from '../API/api'
import pino from '../logger/pino-logger'
import { ExceptionCategory } from '../logger/exceptions'
import isMobilePhone from '../validators/isMobilePhone'
import { resizeImage } from '../utils/image'

import { GD_GUN_CREDENTIALS } from '../constants/localStorage'
import delUndefValNested from '../utils/delUndefValNested'
import defaultGun from './gundb'
import UserProperties from './UserPropertiesClass'
import { getUserModel, type UserModel } from './UserModel'
import { type StandardFeed } from './StandardFeed'
const logger = pino.child({ from: 'UserStorage' })

const EVENT_TYPE_WITHDRAW = 'withdraw'
const EVENT_TYPE_BONUS = 'bonus'
const EVENT_TYPE_CLAIM = 'claim'
const EVENT_TYPE_SEND = 'send'
const EVENT_TYPE_RECEIVE = 'receive'
const CONTRACT_EVENT_TYPE_PAYMENT_WITHDRAW = 'PaymentWithdraw'
const CONTRACT_EVENT_TYPE_PAYMENT_CANCEL = 'PaymentCancel'
const CONTRACT_EVENT_TYPE_TRANSFER = 'Transfer'

const COMPLETED_BONUS_REASON_TEXT = 'Your recent earned rewards'
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
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
  sea: any,
}

/**
 * possible privacy level for profile fields
 */
type FieldPrivacy = 'private' | 'public' | 'masked'

type ACK = {
  ok: number,
  err: string,
}
type EncryptedField = any

/**
 * User's profile field data
 */
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy,
}

/**
 * User's feed event data
 */
export type FeedEvent = {
  id: string,
  type: string,
  date: string,
  createdDate?: string,
  status?: 'pending' | 'completed' | 'error' | 'cancelled' | 'deleted',
  data: any,
  displayType?: string,
  action?: string,
}

/**
 * Survey details
 */
export type SurveyDetails = {
  amount: string,
  reason: string,
  survey: string,
}

/**
 * Blockchain transaction event data
 */
export type TransactionEvent = FeedEvent & {
  data: {
    to?: string,
    from?: string,
    reason?: string,
    amount: number,
    paymentLink?: string,
    code?: string,
  },
}

export const welcomeMessage = {
  id: '1',
  type: 'welcome',
  status: 'completed',
  data: {
    customName: 'Welcome to GoodDollar!',
    subtitle: 'Welcome to GoodDollar!',
    readMore: 'Claim free G$ coins daily.',
    receiptData: {
      from: NULL_ADDRESS,
    },
    reason: Config.isPhaseZero
      ? 'This is where you will claim UBI in\nGoodDollar coins every day.\nThis is a demo version - please note that all\ndemo G$ coins collected have no value\noutside of this pilot, and will be destroyed\nupon completion of the demo period.'
      : 'Right here is where you will claim your basic income in GoodDollar coins every day.\n\nTogether, we will build a better financial future for all of us!',
  },
}

export const welcomeMessageOnlyEtoro = {
  id: '1',
  type: 'welcome',
  status: 'completed',
  data: {
    customName: 'Welcome to GoodDollar!',
    subtitle: 'Welcome to GoodDollar!',
    readMore: false,
    receiptData: {
      from: NULL_ADDRESS,
    },
    reason:
      'Start collecting your income by claiming GoodDollars every day. Since this is a test version - all coins are “play” coins and have no value outside of this pilot, you can use them to buy goods during the trail, at the end of it, they will be returned to the system.',
  },
}

export const inviteFriendsMessage = {
  id: '0',
  type: 'invite',
  status: 'completed',
  data: {
    customName: `Invite friends and earn G$'s`,
    subtitle: Config.isPhaseZero ? 'Want to earn more G$`s ?' : 'Invite your friends now',
    readMore: Config.isPhaseZero ? 'Invite more friends!' : 'and let them also claim free G$`s.',
    receiptData: {
      from: NULL_ADDRESS,
    },
    reason:
      'Help expand the network by inviting family, friends, and colleagues to participate and claim their daily income.\nThe more people join, the more effective GoodDollar will be, for everyone.',
  },
  action: `navigate("Rewards")`,
}
export const backupMessage = {
  id: '2',
  type: 'backup',
  status: 'completed',
  data: {
    customName: 'Backup your wallet. Now.',
    subtitle: 'You need to backup your',
    readMore: 'wallet pass phrase.',
    receiptData: {
      from: NULL_ADDRESS,
    },
    reason:
      'Your pass phrase is the only key to your wallet, this is why our wallet is super secure. Only you have access to your wallet and money. But if you won’t backup your pass phrase or if you lose it — you won’t be able to access your wallet and all your money will be lost forever.',
  },
}

export const startSpending = {
  id: '3',
  type: 'spending',
  status: 'completed',
  data: {
    customName: 'Go to GoodMarket',
    subtitle: "Start spending your G$'s",
    readMore: 'here >>>',
    receiptData: {
      from: NULL_ADDRESS,
    },
    reason:
      'Visit GoodMarket, eToro’s exclusive marketplace, where you can buy or sell items in exchange for GoodDollars.',
  },
}

export const startClaiming = {
  id: '4',
  type: 'claiming',
  status: 'completed',
  data: {
    customName: `Claim your G$'s today!`, //title in modal
    subtitle: `Claim your G$'s today!`, //title in feed list
    readMore: false,
    receiptData: {
      from: NULL_ADDRESS,
    },

    // preReasonText: 'Claim 14 days & secure a spot in the live upcoming version.',
    reason: Config.isPhaseZero
      ? `Hey, just a reminder to claim your daily G$’s.\nRemember, claim for 14 days and secure\na spot for GoodDollar’s live launch.`
      : `GoodDollar gives every active member a small daily income.\n\nEvery day, sign in and claim free GoodDollars and use them to pay for goods and services.`,
  },
}

export const longUseOfClaims = {
  id: '5',
  type: 'claimsThreshold',
  status: 'completed',
  data: {
    customName: 'Woohoo! You’ve made it!', //title in modal
    subtitle: 'Woohoo! You’ve made it!',
    smallReadMore: 'Congrats! You claimed G$ for 14 days.',
    receiptData: {
      from: NULL_ADDRESS,
    },
    reason: `Nice work. You’ve claimed demo G$’s for\n14 days and your spot is now secured for\nGoodDollar’s live launch.\nLive G$ coins are coming your way soon!`,
    endpoint: {
      fullName: 'Congrats! You’ve made it!',
    },
  },
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
          if (!acc[curr.name] || (acc[curr.name] && acc[curr.name].value && acc[curr.name].value < curr.value)) {
            return { ...acc, [curr.name]: curr.value }
          }
          return acc
        },
        { name: log.name },
      ),
    )

  //maxBy is used in case transaction also paid a TX fee/burn, so since they are small
  //it filters them out
  const transferLog = maxBy(
    logs.filter(log => {
      return log && log.name === CONTRACT_EVENT_TYPE_TRANSFER
    }),
    log => log.value,
  )
  const withdrawLog = logs.find(log => {
    return log && (log.name === CONTRACT_EVENT_TYPE_PAYMENT_WITHDRAW || log.name === CONTRACT_EVENT_TYPE_PAYMENT_CANCEL)
  })
  logger.debug('getReceiveDataFromReceipt', {
    logs: receipt.logs,
    transferLog,
    withdrawLog,
  })
  const log = withdrawLog || transferLog
  return log
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
  // gunuser: Gun

  /**
   * a gun node referring to gun
   * @instance {Gun}
   */
  gun: Gun

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {Gun}
   */
  // properties: Gun

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {UserProperties}
   */
  userProperties: UserProperties

  /**
   * a gun node refering to gun.user().get('profile')
   * @instance {Gun}
   */
  // profile: Gun

  /**
   * a gun node refering to gun.user().get('feed')
   * @instance {Gun}
   */
  // feed: Gun

  /**
   * current feed item
   */
  cursor: number = 0

  /**
   * In memory array. keep number of events per day
   * @instance {Gun}
   */
  feedIndex: Array<[Date, number]>

  feedIds: {} = {}

  feedMutex = new Mutex()

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

  profileSettings: any

  /**
   * Magic line for recovery user
   */
  magiclink: String

  static indexableFields = {
    email: true,
    mobile: true,
    mnemonic: true,
    phone: true,
    walletAddress: true,
    username: true,
  }

  // trusted GoodDollar user indexes
  trust = {}

  ready: Promise<boolean> = null

  /**
   * Clean string removing blank spaces and special characters, and converts to lower case
   *
   * @param {string} field - Field name
   * @param {string} value - Field value
   * @returns {string} - Value without '+' (plus), '-' (minus), '_' (underscore), ' ' (space), in lower case
   */
  static cleanHashedFieldForIndex = (field: string, value: string): string => {
    if (value === undefined) {
      return value
    }
    if (field === 'mobile' || field === 'phone') {
      return sha3(value.replace(/[_-\s]+/g, ''))
    }
    return sha3(`${value}`.toLowerCase())
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

  /**
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<*>}
   */
  static async getMnemonic(username: String, password: String): Promise<String> {
    let gun = defaultGun
    let gunuser = gun.user()
    let mnemonic = ''

    //hack to get gun working. these seems to preload data gun needs to login
    //otherwise it get stuck on a clean incognito
    const existingUser = await this.gun.get('~@' + username).onThen(null, { wait: 3000 })
    logger.debug('getMnemonic:', { existingUser })
    const authUserInGun = (username, password) => {
      return new Promise((res, rej) => {
        gunuser.auth(username, password, user => {
          logger.debug('getMnemonic gundb auth', { user })
          if (user.err) {
            const error = isString(user.err) ? new Error(user.err) : user.err
            logger.error('Error getMnemonic UserStorage', error.message, error)
            return rej(false)
          }
          res(true)
        })
      })
    }

    if (existingUser && (await authUserInGun(username, password))) {
      const profile = gunuser.get('profile')
      mnemonic = await profile
        .get('mnemonic')
        .get('value')
        .decrypt()
      logger.debug('getMnemonic', { mnemonic })
      await gunuser.leave()
    }

    return mnemonic
  }

  constructor(wallet: GoodWallet, gun: Gun) {
    this.gun = gun || defaultGun
    this.wallet = wallet
    this.feedEvents = new EventEmitter()
    this.init()
  }

  get profile() {
    return this.gun.user().get('profile')
  }

  get gunuser() {
    return this.gun.user()
  }

  get feed() {
    return this.gun.user().get('feed')
  }

  gunAuth(username: string, password: string): Promise<any> {
    return new Promise((res, rej) => {
      this.gunuser.auth(username, password, user => {
        logger.debug('gundb auth', user.err)
        if (user.err) {
          return rej(user.err)
        }
        res(user)
      })
    })
  }

  gunCreate(username: string, password: string): Promise<any> {
    return new Promise((res, rej) => {
      this.gunuser.create(username, password, user => {
        logger.debug('gundb user created', user)

        //if username exists its not an error we can create
        //multiple accounts under same username
        // if (user.err) {
        //   return rej(user.err)
        // }
        res(user)
      })
    })
  }

  /**
   * Initialize wallet, gundb user, feed and subscribe to events
   */
  async initGun() {
    logger.debug('Initializing GunDB UserStorage')

    this.profileSettings = {
      fullName: { defaultPrivacy: 'public' },
      email: { defaultPrivacy: Config.isEToro ? 'public' : 'private' },
      mobile: { defaultPrivacy: Config.isEToro ? 'public' : 'private' },
      mnemonic: { defaultPrivacy: 'private' },
      avatar: { defaultPrivacy: 'public' },
      smallAvatar: { defaultPrivacy: 'public' },
      walletAddress: { defaultPrivacy: 'public' },
      username: { defaultPrivacy: 'public' },
      loginToken: { defaultPrivacy: 'private' },
    }

    if (this.gunuser.is) {
      logger.debug('init:', 'logging out first')
      this.gunuser.leave()
    }

    let loggedInPromise

    let existingCreds = await AsyncStorage.getItem(GD_GUN_CREDENTIALS)
    if (existingCreds == null) {
      const seed = this.wallet.wallet.eth.accounts.wallet[this.wallet.getAccountForType('gundb')].privateKey.slice(2)
      loggedInPromise = gunPKAuth(this.gun, seed)
    } else {
      logger.debug('gun login using saved credentials', { existingCreds })

      this.gunuser.restore(existingCreds)
      loggedInPromise = Promise.resolve(this.gunuser)
    }

    let user = await loggedInPromise.catch(e => {
      logger.warn(e)
      throw e
    })
    logger.debug('init finished gun loggin', user)

    if (user === undefined) {
      throw new Error('gun login failed')
    }
    this.user = this.gunuser.is

    //try to make sure all gun SEA  decryption keys are preloaded
    this.gunuser.get('trust').load()

    logger.debug('GunDB logged in', {
      pubkey: this.gunuser.is,
      pair: this.gunuser.pair(),

      // gunuser,
    })

    // await Promise.all([this.initProperties(), this.initProfile()])
    this.initProfile().catch(e => logger.error('failed initializing initProfile', e.message, e))
    await this.initProperties()
  }

  /**
   * Initialize wallet, gundb user, feed and subscribe to events
   */
  async initRegistered() {
    logger.debug('Initializing GunDB UserStorage for resgistered user', this.initializedRegistered)

    if (this.initializedRegistered) {
      return
    }

    // get trusted GoodDollar indexes and pub key
    let trustPromise = this.fetchTrustIndexes()

    logger.debug('subscribing to wallet events')

    this.wallet.subscribeToEvent(EVENT_TYPE_RECEIVE, event => {
      logger.debug({ event }, EVENT_TYPE_RECEIVE)
    })

    this.wallet.subscribeToEvent(EVENT_TYPE_SEND, event => {
      logger.debug({ event }, EVENT_TYPE_SEND)
    })

    this.wallet.subscribeToEvent('otplUpdated', receipt => this.handleOTPLUpdated(receipt))
    this.wallet.subscribeToEvent('receiptUpdated', receipt => this.handleReceiptUpdated(receipt))
    this.wallet.subscribeToEvent('receiptReceived', receipt => this.handleReceiptUpdated(receipt))

    // for some reason doing init stuff before  causes gun to get stuck
    // this issue doesnt exists for gun 2020 branch, but we cant upgrade there yet
    // doing await one by one - Gun hack so it doesnt get stuck
    await Promise.all([
      trustPromise,
      AsyncStorage.getItem('GD_trust').then(_ => (this.trust = _ || {})),
      this.initFeed(),
    ]).catch(e => {
      logger.error('failed init step in userstorage', e.message, e)
      throw e
    })
    logger.debug('starting systemfeed and tokens')
    this.startSystemFeed().catch(e => logger.error('failed initializing startSystemFeed', e.message, e))

    this.gun
      .get('users')
      .get(this.gunuser.is.pub)
      .put(this.gunuser) // save ref to user
    logger.debug('done initializing registered userstorage')
    this.initializedRegistered = true

    // save ref to user
    this.gun
      .get('users')
      .get(this.gunuser.is.pub)
      .put(this.gunuser)
    return true
  }

  init(): Promise {
    const { wallet } = this

    this.ready = (async () => {
      try {
        // firstly, awaiting for wallet is ready
        await wallet.ready

        const isReady = await retry(() => this.initGun(), 1) // init user storage, if exception thrown, retry init one more times

        logger.debug('userStorage initialized.')
        return isReady
      } catch (exception) {
        let logLevel = 'error'
        const { account } = wallet
        const { message } = exception

        if (message && message.includes('Wrong user or password')) {
          logLevel = 'warn'
        }

        logger[logLevel]('Error initializing UserStorage', message, exception, {
          account,
        })
        throw exception
      }
    })()

    return this.ready
  }

  /**
   * Fetches trusted GoodDollar indexes and pub key
   * @returns Promise
   * @private
   */
  async fetchTrustIndexes() {
    try {
      // make sure server is up
      await API.ping()

      // fetch trust data
      const { data } = await API.getTrust()

      AsyncStorage.setItem('GD_trust', data)
      this.trust = data
    } catch (exception) {
      const { message } = exception

      // if fetch trust request failed even we're pinged the server - it's an exception
      logger.error('Could not fetch /trust', message, exception)
    }
  }

  /**
   * Set small avatar for user in case he doesn't have it
   *
   * @returns {Promise}
   */
  async checkSmallAvatar() {
    const avatar = await this.getProfileFieldValue('avatar')
    const smallAvatar = await this.getProfileFieldValue('smallAvatar')

    if (avatar && !smallAvatar) {
      logger.debug('Updating small avatar')

      await this.setSmallAvatar(avatar)
    }
  }

  setAvatar(avatar) {
    return Promise.all([this.setProfileField('avatar', avatar, 'public'), this.setSmallAvatar(avatar)])
  }

  async setSmallAvatar(avatar) {
    const smallAvatar = await resizeImage(avatar, 50)
    return this.setProfileField('smallAvatar', smallAvatar, 'public')
  }

  removeAvatar() {
    return Promise.all([
      this.setProfileField('avatar', null, 'public'),
      this.setProfileField('smallAvatar', null, 'public'),
    ])
  }

  /**
   * Create magic line for recovery user
   *
   * @param {string} username
   * @param {string} password
   *
   * @returns {string}
   */
  createMagicLink(username: String, password: String): String {
    let magicLink = `${username}+${password}`
    magicLink = Buffer.from(magicLink)
      .toString('base64')
      .replace(/==$/, '')

    return magicLink
  }

  /**
   * return magic line
   */
  getMagicLink() {
    return this.magiclink
  }

  getOperationType(data: any, account: string) {
    const EVENT_TYPES = {
      PaymentWithdraw: 'withdraw',
    }

    let operationType
    if (data.from) {
      if (data.from === this.wallet.UBIContract.address.toLowerCase()) {
        operationType = EVENT_TYPE_CLAIM
      } else if (data.from === this.wallet.getSignUpBonusAddress()) {
        operationType = EVENT_TYPE_BONUS
      } else {
        operationType = data.from === account.toLowerCase() ? EVENT_TYPE_SEND : EVENT_TYPE_RECEIVE
      }
    }
    return EVENT_TYPES[data.name] || operationType
  }

  async handleReceiptUpdated(receipt: any): Promise<FeedEvent | void> {
    //first check to save time if already exists
    let feedEvent = await this.getFeedItemByTransactionHash(receipt.transactionHash)
    if (get(feedEvent, 'data.receiptData', feedEvent && feedEvent.receiptReceived)) {
      return feedEvent
    }

    //receipt received via websockets/polling need mutex to prevent race
    //with enqueing the initial TX data
    const data = getReceiveDataFromReceipt(receipt)
    if (
      data &&
      (data.name === CONTRACT_EVENT_TYPE_PAYMENT_CANCEL ||
        (data.name === CONTRACT_EVENT_TYPE_PAYMENT_WITHDRAW && data.from === data.to))
    ) {
      logger.debug('handleReceiptUpdated: skipping self withdrawn payment link (cancelled)', { data, receipt })
      return
    }
    const release = await this.feedMutex.lock()
    try {
      logger.debug('handleReceiptUpdated', { data, receipt })

      //get initial TX data from queue, if not in queue then it must be a receive TX ie
      //not initiated by user
      //other option is that TX was processed on another wallet instance
      const initialEvent = (await this.dequeueTX(receipt.transactionHash)) || {
        data: {},
      }
      logger.debug('handleReceiptUpdated got enqueued event:', {
        id: receipt.transactionHash,
        initialEvent,
      })

      const receiptDate = await this.wallet.wallet.eth
        .getBlock(receipt.blockNumber)
        .then(_ => new Date(_.timestamp * 1000))
        .catch(_ => new Date())

      //get existing or make a new event (calling getFeedItem again because this is after mutex, maybe something changed)
      feedEvent = (await this.getFeedItemByTransactionHash(receipt.transactionHash)) || {
        id: receipt.transactionHash,
        createdDate: receiptDate.toString(),
        type: this.getOperationType(data, this.wallet.account),
      }

      if (get(feedEvent, 'data.receiptData', feedEvent && feedEvent.receiptReceived)) {
        logger.debug('handleReceiptUpdated skipping event with existed receipt data', feedEvent, receipt)
        return feedEvent
      }

      //merge incoming receipt data into existing event
      const updatedFeedEvent: FeedEvent = {
        ...feedEvent,
        ...initialEvent,
        status: feedEvent.otplStatus === 'cancelled' ? feedEvent.status : receipt.status ? 'completed' : 'error',
        receiptReceived: true,
        date: receiptDate.toString(),
        data: {
          ...feedEvent.data,
          ...initialEvent.data,
          receiptData: data,
        },
      }

      if (feedEvent.type === EVENT_TYPE_BONUS && receipt.status) {
        updatedFeedEvent.data.reason = COMPLETED_BONUS_REASON_TEXT
        updatedFeedEvent.data.customName = 'GoodDollar'
      }

      logger.debug('handleReceiptUpdated receiptReceived', {
        initialEvent,
        feedEvent,
        receipt,
        data,
        updatedFeedEvent,
      })

      if (isEqual(feedEvent, updatedFeedEvent) === false) {
        await this.updateFeedEvent(updatedFeedEvent, feedEvent.date)
      }

      return updatedFeedEvent
    } catch (e) {
      logger.error('handleReceiptUpdated failed', e.message, e)
    } finally {
      release()
    }
    return
  }

  /**
   * callback to use when we get a transaction that withdrawn our payment link
   * @param {*} receipt
   */
  async handleOTPLUpdated(receipt: any): Promise<FeedEvent> {
    //receipt received via websockets/polling need mutex to prevent race
    //with enqueing the initial TX data
    const release = await this.feedMutex.lock()
    try {
      const data = getReceiveDataFromReceipt(receipt)
      logger.debug('handleOTPLUpdated', { data, receipt })

      //get our tx that created the payment link
      //paymentId is new format, hash is in old beta format
      const originalTXHash = await this.getTransactionHashByCode(data.hash || data.paymentId)
      if (originalTXHash === undefined) {
        logger.error(
          'handleOTPLUpdated failed',
          'Original payment link TX not found',
          new Error('handleOTPLUpdated Failed: Original payment link TX not found'),
          { data, receipt },
        )
        return
      }

      const feedEvent = {
        data: {},
        ...((await this.getFeedItemByTransactionHash(originalTXHash)) || {}),
      }

      if (get(feedEvent, 'data.otplData')) {
        logger.debug('handleOTPLUpdated skipping event with existed receipt data', feedEvent, receipt)
        return feedEvent
      }

      const receiptDate = await this.wallet.wallet.eth
        .getBlock(receipt.blockNumber)
        .then(_ => new Date(_.timestamp * 1000))
        .catch(_ => new Date())

      //if we withdrawn the payment link then its canceled
      const otplStatus =
        data.name === CONTRACT_EVENT_TYPE_PAYMENT_CANCEL || data.to === data.from ? 'cancelled' : 'completed'
      const prevDate = feedEvent.date
      feedEvent.data.from = data.from
      feedEvent.data.to = data.to
      feedEvent.data.otplData = data
      feedEvent.status = feedEvent.data.otplStatus = otplStatus
      feedEvent.date = receiptDate.toString()
      logger.debug('handleOTPLUpdated receiptReceived', {
        feedEvent,
        otplStatus,
        receipt,
        data,
      })
      await this.updateFeedEvent(feedEvent, prevDate)
      return feedEvent
    } catch (e) {
      logger.error('handleOTPLUpdated', e.message, e)
    } finally {
      release()
    }
    return {}
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
  getFeedItemByTransactionHash(transactionHash: string): Promise<FeedEvent> {
    const feedItem = this.feedIds[transactionHash]
    if (feedItem) {
      return feedItem
    }

    return this.feed
      .get('byid')
      .get(transactionHash)
      .decrypt()
      .then(feedItem => {
        // update feed cache here
        this.feedIds[transactionHash] = feedItem
        return feedItem
      })
      .catch(noop)
  }

  /**
   * Returns a Promise that, when resolved, will have all the feeds available for the current user
   * @returns {Promise<Array<FeedEvent>>}
   */
  async getAllFeed() {
    const total = values((await this.feed.get('index').then(null, 1000)) || {}).reduce((acc, curr) => acc + curr, 0)
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
    let dayToNumEvents: Array<[string, number]> = toPairs(changed)
    this.feedIndex = orderBy(dayToNumEvents, day => day[0], 'desc')
    this.feedEvents.emit('updated')
    logger.debug('updateFeedIndex', {
      changed,
      field,
      newIndex: this.feedIndex,
    })
  }

  writeFeedEvent(event): Promise<FeedEvent> {
    this.feedIds[event.id] = event
    AsyncStorage.setItem('GD_feed', this.feedIds)
    this.feedEvents.emit('updated', { event })
    return this.feed
      .get('byid')
      .get(event.id)
      .secretAck(event)
      .catch(e => {
        logger.error('writeFeedEvent failed:', e.message, e, { event })
        throw e
      })
  }

  /**
   * Subscribes to changes on the event index of day to number of events
   * the "false" (see gundb docs) passed is so we get the complete 'index' on every change and not just the day that changed
   */
  async initFeed() {
    const { feed } = await this.gunuser

    logger.debug('init feed', { feed })

    if (feed == null) {
      // for some reason this breaks on gun 2020 https://github.com/amark/gun/issues/987
      await this.feed
        .putAck({ initialized: true }) // restore old feed data - after nullified
        .catch(e => {
          logger.error('restore old feed data failed:', e.message, e)
          throw e
        })

      logger.debug('init empty feed', { feed })
    }

    this.feed.get('index').on(this.updateFeedIndex, false)

    // load unencrypted feed from cache
    this.feedIds = await AsyncStorage.getItem('GD_feed')
      .catch(() => {
        logger.warn('failed parsing feed from cache')
      })
      .then(ids => ids || {})

    //no need to block on this
    this._syncFeedCache()
  }

  async _syncFeedCache() {
    const items = await this.feed
      .get('byid')
      .then(null, 2000)
      .catch(e => {
        logger.warn('fetch byid onthen failed', { e })
      })

    logger.debug('init feed cache byid', { items })

    if (!items) {
      await this.feed.putAck({ byid: {} }).catch(e => {
        logger.error('init feed cache byid failed:', e.message, e)
        throw e
      })

      return
    }

    const ids = Object.entries(omit(items, '_'))

    logger.debug('init feed cache got items', { ids })

    const promises = ids.map(async ([k, v]) => {
      if (this.feedIds[k]) {
        return false
      }

      const data = await this.feed
        .get('byid')
        .get(k)
        .decrypt()
        .catch(noop)

      logger.debug('init feed cache got missing cache item', { id: k, data })

      if (!data) {
        return false
      }

      this.feedIds[k] = data
      return true
    })

    Promise.all(promises)
      .then(shouldUpdateStatuses => {
        if (!some(shouldUpdateStatuses)) {
          return
        }

        logger.debug('init feed updating cache', this.feedIds, shouldUpdateStatuses)
        AsyncStorage.setItem('GD_feed', this.feedIds)
        this.feedEvents.emit('updated', {})
      })
      .catch(e => logger.error('error caching feed items', e.message, e))
  }

  async startSystemFeed() {
    const userProperties = await this.userProperties.getAll()
    const firstVisitAppDate = userProperties.firstVisitApp
    logger.debug('startSystemFeed', { userProperties, firstVisitAppDate })
    this.addBackupCard()
    this.addStartClaimingCard()

    // first time user visit
    if (firstVisitAppDate == null) {
      if (Config.isEToro) {
        this.enqueueTX(welcomeMessageOnlyEtoro)

        setTimeout(() => {
          this.enqueueTX(startSpending)
        }, 60 * 1000) // 1 minute
      } else {
        this.enqueueTX(welcomeMessage)
      }

      if (Config.enableInvites) {
        setTimeout(() => {
          this.enqueueTX(inviteFriendsMessage)
        }, 2 * 60 * 1000) // 2 minutes
      }

      await this.userProperties.set('firstVisitApp', Date.now())
    }

    logger.debug('startSystemFeed: done')
  }

  /**
   * Save user properties
   */
  async initProperties() {
    // this.properties = this.gunuser.get('properties')

    this.userProperties = new UserProperties(this.gun)
    const properties = await this.userProperties.ready
    logger.debug('init properties', { properties })
  }

  async initProfile() {
    const [gunuser, profile] = await Promise.all([this.gunuser.then(null, 1000), this.profile.then(null, 1000)])

    if (profile === null) {
      // in case profile was deleted in the past it will be exactly null
      await this.profile.putAck({ initialized: true }).catch(e => {
        logger.error('set profile initialized failed:', e.message, e)
        throw e
      })
    }

    // this.profile = this.gunuser.get('profile')
    const onProfileUpdate = debounce(
      doc => {
        this._lastProfileUpdate = doc
        over(this.subscribersProfileUpdates)(doc)
      },
      500,
      { leading: false, trailing: true },
    )
    this.profile.open(onProfileUpdate)

    logger.debug('init opened profile', {
      gunRef: this.profile,
      profile,
      gunuser,
    })
  }

  addAllCardsTest() {
    ;[welcomeMessage, inviteFriendsMessage, startClaiming, longUseOfClaims, startSpending].forEach(m => {
      const copy = Object.assign({}, m, { id: String(Math.random()) })
      this.enqueueTX(copy)
    })
  }

  /**
   * if necessary, add a backup card
   *
   * @returns {Promise<void>}
   */
  async addBackupCard() {
    const userProperties = await this.userProperties.getAll()
    const firstVisitAppDate = userProperties.firstVisitApp
    const displayTimeFilter = 24 * 60 * 60 * 1000 // 24 hours
    const allowToShowByTimeFilter = firstVisitAppDate && Date.now() - firstVisitAppDate >= displayTimeFilter

    if (Config.torusEnabled === false && !userProperties.isMadeBackup && allowToShowByTimeFilter) {
      await this.enqueueTX(backupMessage)
      await this.userProperties.set('isMadeBackup', true)
    }
  }

  /**
   * add a start claiming card after 3 days
   *
   * @returns {Promise<void>}
   */
  async addStartClaimingCard() {
    const firstVisitAppDate = this.userProperties.get('firstVisitApp')
    const displayTimeFilter = Config.displayStartClaimingCardTime
    const allowToShowByTimeFilter = firstVisitAppDate && Date.now() - firstVisitAppDate >= displayTimeFilter

    if (allowToShowByTimeFilter && this.userProperties.get('startClaimingAdded') !== true) {
      await this.userProperties.set('startClaimingAdded', true)
      await this.enqueueTX(startClaiming)
    }
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
      .catch(reason => {
        let exception = reason
        let { message } = exception

        if (!isError(reason)) {
          message = reason
          exception = new Error(reason)
        }

        logger.error('getProfileFieldValue decrypt failed:', message, exception, { field })
      })
  }

  getProfileFieldDisplayValue(field: string): Promise<string> {
    return this.profile
      .get(field)
      .get('display')
      .then()
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
      (acc, currKey) => ({
        ...acc,
        [currKey]: profile[currKey].display,
      }),
      {},
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
    const keys = this._getProfileFields(profile)
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

  async getFieldPrivacy(field) {
    const currentPrivacy = await this.profile.get(field).get('privacy')

    return currentPrivacy || this.profileSettings[field].defaultPrivacy || 'public'
  }

  /**
   * Save profile with all validations and indexes
   * It saves only known profile fields
   *
   * @param {UserModel} profile - User profile
   * @param {boolean} update - are we updating, if so validate only non empty fields, otherwise also set default privacy
   * @returns {Promise} Promise with profile settings updates and privacy validations
   * @throws Error if profile is invalid
   */
  async setProfile(profile: UserModel, update: boolean = false): Promise<> {
    if (profile && !profile.validate) {
      profile = getUserModel(profile)
    }

    const { errors, isValid } = profile.validate(update)

    if (!isValid) {
      logger.error(
        'setProfile failed',
        'Fields validation failed',
        new Error('setProfile failed: Fields validation failed'),
        { errors, category: ExceptionCategory.Human },
      )

      throw errors
    }

    if (profile.avatar) {
      profile.smallAvatar = await resizeImage(profile.avatar, 50)
    }

    const results = await Promise.all(
      keys(this.profileSettings)
        .filter(key => profile[key])
        .map(async field => {
          let isPrivate = get(this.profileSettings, `[${field}].defaultPrivacy`, 'private')

          if (update) {
            isPrivate = await this.getFieldPrivacy(field)
          }

          try {
            return await this.setProfileField(field, profile[field], isPrivate)
          } catch (e) {
            //logger.error('setProfile field failed:', e.message, e, { field })
            return { err: `failed saving field ${field}` }
          }
        }),
    )

    const gunErrors = results.filter(ack => ack && ack.err).map(ack => ack.err)

    if (gunErrors.length <= 0) {
      return true
    }

    logger.error(
      'setProfile partially failed',
      'some of the fields failed during saving',
      new Error('setProfile: some fields failed during saving'),
      {
        errCount: gunErrors.length,
        errors: gunErrors,
        strErrors: JSON.stringify(gunErrors),
      },
    )

    throw gunErrors
  }

  /**
   *
   * @param {string} field
   * @param {string} value
   * @param {string} privacy
   * @returns {boolean}
   */
  static async isValidValue(field: string, value: string, trusted: boolean = false) {
    const cleanValue = UserStorage.cleanHashedFieldForIndex(field, value)

    if (!cleanValue) {
      logger.error(
        `indexProfileField - field ${field} value is empty (value: ${value})`,
        cleanValue,
        new Error('isValidValue failed'),
        { category: ExceptionCategory.Human },
      )
      return false
    }

    //we no longer enforce uniqueness on email/mobile only on username
    try {
      if (field === 'username') {
        const indexValue = await global.gun
          .get(`users/by${field}`)
          .get(cleanValue)
          .then()
        return !(indexValue && indexValue.pub !== global.gun.user().is.pub)
      }

      return true
    } catch (e) {
      logger.error('Validate IndexProfileField failed', e.message, e)
      return true
    }
  }

  async validateProfile(profile: any) {
    if (!profile) {
      return { isValid: false, errors: {} }
    }
    const fields = Object.keys(profile).filter(prop => UserStorage.indexableFields[prop])

    const validatedFields = await Promise.all(
      fields.map(async field => ({
        field,
        valid: await UserStorage.isValidValue(field, profile[field], true),
      })),
    )
    const errors = validatedFields.reduce((accErrors, curr) => {
      if (!curr.valid) {
        accErrors[curr.field] = `Unavailable ${curr.field}`
      }
      return accErrors
    }, {})

    const isValid = validatedFields.every(elem => elem.valid)
    logger.debug({ fields, validatedFields, errors, isValid, profile })

    return { isValid, errors }
  }

  /**
   * Set profile field with privacy settings
   *
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @returns {Promise} Promise with updated field value, secret, display and privacy.
   */
  async setProfileField(
    field: string,
    value: string,
    privacy: FieldPrivacy = 'public',
    onlyPrivacy: boolean = false,
  ): Promise<ACK> {
    let display

    switch (privacy) {
      case 'private':
        display = '******'
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

    const storePrivacy = () =>
      this.profile
        .get(field)
        .putAck({ display, privacy })
        .catch(e => {
          logger.warn('saving profile field display and privacy failed', e.message, e, { field })
          throw e
        })

    if (onlyPrivacy) {
      return storePrivacy()
    }

    return Promise.race([
      this.profile
        .get(field)
        .get('value')
        .secretAck(value)
        .catch(e => {
          logger.warn('encrypting profile field failed', e.message, e, { field })
          throw e
        }),

      storePrivacy(),
    ])
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
    const cleanValue = UserStorage.cleanHashedFieldForIndex(field, value)
    if (!cleanValue) {
      return Promise.resolve({
        err: 'Indexable field cannot be null or empty',
        ok: 0,
      })
    }

    try {
      if (field === 'username' && !(await UserStorage.isValidValue(field, value, false))) {
        return Promise.resolve({
          err: `Existing index on field ${field}`,
          ok: 0,
        })
      }
      const indexNode = this.gun.get(`users/by${field}`).get(cleanValue)
      const indexValue = await indexNode.then()

      logger.debug('indexProfileField', {
        field,
        value,
        privacy,
        indexValue: indexValue,
        currentUser: this.gunuser.is.pub,
      })

      // now that we use the hash of the email/mobile there's no privacy issue
      // if (privacy !== 'public' && indexValue !== undefined) {
      //   return indexNode.putAck(null)
      // }

      return await indexNode.putAck(this.gunuser)
    } catch (gunError) {
      const e = this._gunException(gunError)

      logger.error('indexProfileField failed', e.message, e, { field })

      // TODO: this should return unexpected error
      // return Promise.resolve({ err: `Unexpected Error`, ok: 0 })
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
    return this.setProfileField(field, value, privacy, true)
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
    let { feedIndex, cursor, feedIds } = this

    if (!feedIndex) {
      return []
    }

    if (reset || isUndefined(cursor)) {
      cursor = 0
    }

    // running through the days history until we got the request numResults
    // storing days selected to the daysToTake
    let total = 0
    let daysToTake = takeWhile(feedIndex.slice(cursor), ([, eventsAmount]) => {
      const takeDay = total < numResults

      if (takeDay) {
        total += eventsAmount
      }

      return takeDay
    })

    this.cursor += daysToTake.length

    // going through the days we've selected, fetching feed indexes for that days
    let promises: Array<Promise<Array<FeedEvent>>> = daysToTake.map(([date]) =>
      this.feed
        .get(date)
        .then(data => (typeof data === 'string' ? JSON.parse(data) : data))
        .catch(e => {
          logger.error('getFeed', e.message, e)
          return []
        }),
    )

    // filtering indexed items, taking the items a) having non-empty id b) having unique id
    const eventsIndex = await Promise.all(promises).then(indexes => {
      const filtered = filter(flatten(indexes), 'id')

      return uniqBy(filtered, 'id')
    })

    logger.debug('getFeedPage', {
      feedIndex,
      daysToTake,
      eventsIndex,
    })

    const events = await Promise.all(
      eventsIndex.map(async ({ id }) => {
        // taking feed item from the cache
        let item = feedIds[id]

        // if no item in the cache and it's some transaction
        // then getting tx item details from the wallet
        if (!item && id.startsWith('0x')) {
          const receipt = await this.wallet.getReceiptWithLogs(id).catch(e => {
            logger.warn('no receipt found for id:', id, e.message, e)
          })

          if (receipt) {
            item = await this.handleReceiptUpdated(receipt)
          } else {
            logger.warn('no receipt found for undefined item id:', id)
          }
        }

        // returning item, it may be undefied
        return item
      }),
    )

    // filtering events fetched to exclude empty/null/undefined ones
    return filter(events)
  }

  /**
   * Return all feed events*
   * @returns {Promise} Promise with array of standarised feed events
   * @todo Add pagination
   */
  async getFormattedEvents(numResults: number, reset?: boolean): Promise<Array<StandardFeed>> {
    const feed = await this.getFeedPage(numResults, reset)
    logger.debug('getFormattedEvents page result:', {
      numResults,
      reset,
      feedPage: feed,
    })
    const res = await Promise.all(
      feed
        .filter(
          feedItem =>
            feedItem &&
            feedItem.data &&
            ['deleted', 'cancelled'].includes(feedItem.status) === false &&
            feedItem.otplStatus !== 'cancelled',
        )
        .map(feedItem => {
          if (null == get(feedItem, 'data.receiptData', feedItem && feedItem.receiptReceived)) {
            logger.debug('getFormattedEvents missing feed receipt', { feedItem })
            return this.getFormatedEventById(feedItem.id)
          }

          return this.formatEvent(feedItem).catch(e => {
            logger.error('getFormattedEvents Failed formatting event:', e.message, e, { feedItem })
            return {}
          })
        }),
    )
    logger.debug('getFormattedEvents done formatting events')
    return res
  }

  async getFormatedEventById(id: string): Promise<StandardFeed> {
    const prevFeedEvent = await this.getFeedItemByTransactionHash(id)
    const standardPrevFeedEvent = await this.formatEvent(prevFeedEvent).catch(e => {
      logger.error('getFormatedEventById Failed formatting event:', e.message, e, { id })

      return undefined
    })
    if (!prevFeedEvent) {
      return standardPrevFeedEvent
    }
    if (get(prevFeedEvent, 'data.receiptData', prevFeedEvent && prevFeedEvent.receiptReceived)) {
      return standardPrevFeedEvent
    }

    logger.warn('getFormatedEventById: receipt data missing for:', {
      id,
      standardPrevFeedEvent,
    })

    //if for some reason we dont have the receipt(from blockchain) yet then fetch it
    const receipt = await this.wallet.getReceiptWithLogs(id).catch(e => {
      logger.warn('no receipt found for id:', e.message, e, id)
      return undefined
    })
    if (!receipt) {
      return standardPrevFeedEvent
    }

    //update the event
    let updatedEvent = await this.handleReceiptUpdated(receipt)
    if (updatedEvent === undefined) {
      return standardPrevFeedEvent
    }

    logger.debug('getFormatedEventById updated event with receipt', {
      prevFeedEvent,
      updatedEvent,
    })
    return this.formatEvent(updatedEvent).catch(e => {
      logger.error('getFormatedEventById Failed formatting event:', e.message, e, { id })

      return {}
    })
  }

  /**
   * Checks if username connected to a profile
   * @param {string} username
   */
  async isUsername(username: string) {
    const cleanValue = UserStorage.cleanHashedFieldForIndex('username', username)
    const profile = await this.gun.get('users/byusername').get(cleanValue)
    return profile !== undefined
  }

  /**
   * Save survey
   * @param {string} hash
   * @param {object} details
   * @returns {Promise<void>}
   */
  async saveSurveyDetails(hash, details: SurveyDetails) {
    try {
      const date = moment(new Date()).format('DDMMYY')

      await this.gun.get('survey').get(date)
      await this.gun
        .get('survey')
        .get(date)
        .putAck({ [hash]: details })

      return true
    } catch (gunError) {
      const e = this._gunException(gunError)

      logger.error('saveSurveyDetails :', e.message, e, { details })
      return false
    }
  }

  /**
   * Get all survey
   * @returns {Promise<void>}
   */
  async getSurveyDetailByHashAndDate(hash: string, date: string) {
    const result = await this.gun
      .get('survey')
      .get(date)
      .get(hash)
    return result
  }

  /**
   *
   * @param {string} field - Profile field value (email, mobile or wallet address value)
   * @returns { string } address
   */
  async getUserAddress(field: string) {
    let attr

    if (isMobilePhone(field)) {
      attr = 'mobile'
    } else if (isEmail(field)) {
      attr = 'email'
    } else if (await this.isUsername(field)) {
      attr = 'username'
    }

    if (!attr) {
      return this.wallet.wallet.utils.isAddress(field) ? field : undefined
    }

    const value = UserStorage.cleanHashedFieldForIndex(attr, field)

    return this.gun
      .get(this.trust[`by${attr}`] || `users/by${attr}`)
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
  async getUserProfile(field: string = '') {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'
    const value = UserStorage.cleanHashedFieldForIndex(attr, field)

    const index = this.trust[`by${attr}`] || `users/by${attr}`
    const profileToShow = this.gun
      .get(index)
      .get(value)
      .get('profile')

    const [avatar = undefined, name = 'Unknown Name'] = await Promise.all([
      profileToShow.get('avatar').get('display'),
      profileToShow.get('fullName').get('display'),
    ])

    return { name, avatar }
  }

  /**
   * Returns the feed in a standard format to be loaded in feed list and modal
   *
   * @param {FeedEvent} event - Feed event with data, type, date and id props
   * @returns {Promise} Promise with StandardFeed object,
   *  with props { id, date, type, data: { amount, message, endpoint: { address, fullName, avatar, withdrawStatus }}}
   */
  formatEvent = memoize(
    async (event: FeedEvent): Promise<StandardFeed> => {
      logger.debug('formatEvent: incoming event', event.id, { event })

      try {
        const { data, type, date, id, status, createdDate, animationExecuted, action } = event
        const {
          sender,
          preReasonText,
          reason,
          code: withdrawCode,
          otplStatus,
          customName,
          subtitle,
          readMore,
          smallReadMore,
        } = data

        const { address, initiator, initiatorType, value, displayName, message } = this._extractData(event)
        const withdrawStatus = this._extractWithdrawStatus(withdrawCode, otplStatus, status, type)
        const displayType = this._extractDisplayType(type, withdrawStatus, status)
        logger.debug('formatEvent: initiator data', event.id, {
          initiatorType,
          initiator,
          address,
        })
        const profileNode =
          withdrawStatus !== 'pending' && (await this._getProfileNode(initiatorType, initiator, address)) //dont try to fetch profile node of this is a tx we sent and is pending
        const [avatar, fullName] = await Promise.all([
          this._extractAvatar(type, withdrawStatus, get(profileNode, 'gunProfile'), address).catch(e => {
            logger.warn('formatEvent: failed extractAvatar', e.message, e, {
              type,
              withdrawStatus,
              profileNode,
              address,
            })
            return undefined
          }),
          this._extractFullName(
            customName,
            get(profileNode, 'gunProfile'),
            initiatorType,
            initiator,
            type,
            address,
            displayName,
          ).catch(e => {
            logger.warn('formatEvent: failed extractFullName', e.message, e, {
              customName,
              profileNode,
              initiatorType,
              initiator,
              type,
              address,
              displayName,
            })
          }),
        ])

        return {
          id,
          date: new Date(date).getTime(),
          type,
          displayType,
          status,
          createdDate,
          animationExecuted,
          action,
          data: {
            endpoint: {
              address: sender,
              fullName,
              avatar,
              withdrawStatus,
            },
            amount: value,
            preMessageText: preReasonText,
            message: reason || message,
            subtitle,
            readMore,
            smallReadMore,
            withdrawCode,
          },
        }
      } catch (e) {
        logger.error('formatEvent: failed formatting event:', e.message, e, {
          event,
        })
        return {}
      }
    },
  )

  _extractData({ type, id, data: { receiptData, from = '', to = '', counterPartyDisplayName = '', amount } }) {
    const { isAddress } = this.wallet.wallet.utils
    const data = {
      address: '',
      initiator: '',
      initiatorType: '',
      value: '',
      displayName: '',
      message: '',
    }

    if (type === EVENT_TYPE_SEND) {
      data.address = isAddress(to) ? to : receiptData && receiptData.to
      data.initiator = to
    } else if (type === EVENT_TYPE_CLAIM) {
      data.message = 'Your daily basic income'
    } else {
      data.address = isAddress(from) ? from : receiptData && receiptData.from
      data.initiator = from
    }

    data.initiatorType = isMobilePhone(data.initiator) ? 'mobile' : isEmail(data.initiator) ? 'email' : undefined
    data.address =
      data.address && data.address !== NULL_ADDRESS
        ? UserStorage.cleanHashedFieldForIndex('walletAddress', data.address)
        : data.address
    data.value = (receiptData && (receiptData.value || receiptData.amount)) || amount
    data.displayName = counterPartyDisplayName || 'Unknown'

    logger.debug('formatEvent: parsed data', {
      id,
      type,
      to,
      counterPartyDisplayName,
      from,
      receiptData,
      ...data,
    })

    return data
  }

  _extractWithdrawStatus(withdrawCode, otplStatus = 'pending', status, type) {
    if (type === 'withdraw') {
      return ''
    }
    return status === 'error' ? status : withdrawCode ? otplStatus : ''
  }

  _extractDisplayType(type, withdrawStatus, status) {
    let sufix = ''

    if (type === EVENT_TYPE_WITHDRAW) {
      sufix = withdrawStatus
    }

    if (type === EVENT_TYPE_SEND) {
      sufix = withdrawStatus
    }

    if (type === EVENT_TYPE_BONUS) {
      sufix = status
    }

    return `${type}${sufix}`
  }

  async _getProfileNode(initiatorType, initiator, address): Gun {
    const getProfile = async (indexName, idxKey) => {
      const trustIdx = this.trust[indexName]
      const trustExists =
        trustIdx &&
        (await this.gun
          .get(trustIdx)
          .get(idxKey)
          .then())
      let idxSoul = `users/${indexName}`
      if (trustExists) {
        idxSoul = trustIdx
      }
      logger.debug('extractProfile:', { idxSoul, idxKey, trustExists })

      // Need to verify if user deleted, otherwise gun might stuck here and feed wont be displayed (gun <0.2020)
      let gunProfile = this.gun
        .get(idxSoul)
        .get(idxKey)
        .get('profile')

      //need to return object so promise.all doesnt resolve node
      return {
        gunProfile,
      }

      // logger.warn('_extractProfileToShow invalid profile', { idxSoul, idxKey })
      // return undefined
    }

    if (!initiator && (!address || address === NULL_ADDRESS)) {
      return
    }

    const searchField = initiatorType && `by${initiatorType}`
    const byIndex = searchField && (await getProfile(searchField, initiator))

    const byAddress = address && (await getProfile('bywalletAddress', address))

    return byIndex || byAddress
  }

  //eslint-disable-next-line
  async _extractAvatar(type, withdrawStatus, profileToShow, address) {
    const favicon = Platform.select({
      web: `${process.env.PUBLIC_URL}/favicon-96x96.png`,
      default: require('../../assets/Feed/favicon-96x96.png'),
    })
    const getAvatarFromGun = async () => {
      const avatar = profileToShow && (await profileToShow.get('smallAvatar').then(null, 500))

      // verify account is not deleted and return value
      // if account deleted - the display of 'avatar' field will be private
      return get(avatar, 'privacy') === 'public' ? avatar.display : undefined
    }
    if (
      withdrawStatus === 'error' ||
      type === EVENT_TYPE_BONUS ||
      type === EVENT_TYPE_CLAIM ||
      address === NULL_ADDRESS
    ) {
      return favicon
    }
    return getAvatarFromGun()
  }

  async _extractFullName(customName, profileToShow, initiatorType, initiator, type, address, displayName) {
    const getFullNameFromGun = async () => {
      const fullName = profileToShow && (await profileToShow.get('fullName').then(null, 500))
      logger.debug('profileFromGun:', { fullName })

      // verify account is not deleted and return value
      // if account deleted - the display of 'fullName' field will be private
      return get(fullName, 'privacy') === 'public' ? fullName.display : undefined
    }

    return (
      customName || // if customName exist, use it
      (await getFullNameFromGun()) || // if there's a profile, extract it's fullName
      (initiatorType && initiator) ||
      (type === EVENT_TYPE_CLAIM || address === NULL_ADDRESS ? 'GoodDollar' : displayName)
    )
  }

  /**
   * enqueue a new pending TX done on DAPP, to be later merged with the blockchain tx
   * the DAPP event can contain more details than the blockchain tx event
   * @param {FeedEvent} event
   * @returns {Promise<>}
   */
  async enqueueTX(_event: FeedEvent): Promise<> {
    const event = delUndefValNested(_event)

    //a race exists between enqueing and receipt from websockets/polling
    const release = await this.feedMutex.lock()
    try {
      const existingEvent = this.feedIds[event.id]

      if (existingEvent) {
        logger.warn('enqueueTx skipping existing event id', event, existingEvent)
        return false
      }

      event.status = event.status || 'pending'
      event.createdDate = event.createdDate || new Date().toString()
      event.date = event.date || event.createdDate

      let putRes = await this.feed
        .get('queue')
        .get(event.id)
        .secretAck(event)

      await this.updateFeedEvent(event)
      logger.debug('enqueueTX ok:', { event, putRes })

      return true
    } catch (gunError) {
      const e = this._gunException(gunError)

      logger.error('enqueueTX failed: ', e.message, e, { event })
      return false
    } finally {
      release()
    }
  }

  /**
   * remove and return pending TX
   * @param eventId
   * @returns {Promise<FeedEvent>}
   */
  async dequeueTX(eventId: string): Promise<FeedEvent> {
    try {
      const feedItem = await this.feed
        .get('queue')
        .get(eventId)
        .decrypt()
      logger.debug('dequeueTX got item', eventId, feedItem)
      if (feedItem) {
        this.feed
          .get('queue')
          .get(eventId)
          .put(null)
        return feedItem
      }
    } catch (e) {
      logger.error('dequeueTX failed:', e.message, e)
    }
  }

  /**
   * lookup a pending tx
   * @param {string} eventId
   * @returns {Promise<FeedEvent>}
   */
  peekTX(eventId: string): Promise<FeedEvent> {
    return this.feed.get('queue').get(eventId)
  }

  /**
   * Sets the event's status
   * @param {string} eventId
   * @param {string} status
   * @returns {Promise<FeedEvent>}
   */
  async updateEventStatus(eventId: string, status: string): Promise<FeedEvent> {
    const feedEvent = await this.getFeedItemByTransactionHash(eventId)

    feedEvent.status = status

    return this.writeFeedEvent(feedEvent)
      .then(_ => feedEvent)
      .catch(e => {
        logger.error('updateEventStatus failedEncrypt byId:', e.message, e, {
          feedEvent,
        })

        return {}
      })
  }

  /**
   * Sets the feed animation status
   * @param {string} eventId
   * @param {boolean} status
   * @returns {Promise<FeedEvent>}
   */
  async updateFeedAnimationStatus(eventId: string, status = true): Promise<FeedEvent> {
    const feedEvent = await this.getFeedItemByTransactionHash(eventId)

    feedEvent.animationExecuted = status

    return this.writeFeedEvent(feedEvent)
      .then(_ => feedEvent)
      .catch(e => {
        logger.error('updateFeedAnimationStatus by ID failed:', e.message, e, {
          feedEvent,
        })

        return {}
      })
  }

  /**
   * Sets the event's status
   * @param {string} eventId
   * @param {string} status
   * @returns {Promise<FeedEvent>}
   */
  async updateOTPLEventStatus(eventId: string, status: string): Promise<FeedEvent> {
    const feedEvent = await this.getFeedItemByTransactionHash(eventId)

    feedEvent.otplStatus = status

    return this.writeFeedEvent(feedEvent)
      .then(_ => feedEvent)
      .catch(e => {
        logger.error('updateOTPLEventStatus failedEncrypt byId:', e.message, e, { feedEvent })

        return {}
      })
  }

  /**
   * Sets the event's status as error
   * @param {string} txHash
   * @returns {Promise<void>}
   */
  async markWithErrorEvent(txHash: string): Promise<void> {
    if (txHash === undefined) {
      return
    }

    const release = await this.feedMutex.lock()

    try {
      await this.updateEventStatus(txHash, 'error')
    } catch (e) {
      logger.error('Failed to set error status for feed event', e.message, e)
    } finally {
      release()
    }
  }

  /**
   * Sets the event's status as deleted
   * @param {string} eventId
   * @returns {Promise<FeedEvent>}
   */
  deleteEvent(eventId: string): Promise<FeedEvent> {
    return this.updateEventStatus(eventId, 'deleted')
  }

  /**
   * Sets the event's status as completed
   * @param {string} eventId
   * @returns {Promise<FeedEvent>}
   */
  recoverEvent(eventId: string): Promise<FeedEvent> {
    return this.updateEventStatus(eventId, 'completed')
  }

  /**
   * Sets an OTPL event to cancelled
   * @param eventId
   * @returns {Promise<FeedEvent>}
   */
  async cancelOTPLEvent(eventId: string): Promise<FeedEvent> {
    await this.updateOTPLEventStatus(eventId, 'cancelled')
  }

  /**
   * Add or Update feed event
   *
   * @param {FeedEvent} event - Event to be updated
   * @param {string|*} previouseventDate
   * @returns {Promise} Promise with updated feed
   */
  async updateFeedEvent(event: FeedEvent, previouseventDate: string | void): Promise<FeedEvent> {
    logger.debug('updateFeedEvent:', { event })

    //saving index by onetime code so we can retrieve and update it once withdrawn
    //or skip own withdraw
    const { wallet, feed } = this
    const { utils } = wallet.wallet
    const { id: eventId, type, data } = event
    let { date } = event
    const { code, hashedCode } = data

    if (code) {
      let ownLink
      const eventHashedCode = hashedCode || utils.sha3(code)
      const codeToTxHashRef = feed.get('codeToTxHash')

      switch (type) {
        case EVENT_TYPE_SEND:
          codeToTxHashRef.put({ [eventHashedCode]: eventId })
          break
        case EVENT_TYPE_WITHDRAW:
          ownLink = await codeToTxHashRef.get(eventHashedCode)

          if (!ownLink) {
            break
          }

          logger.debug('updateFeedEvent: skipping own link withdraw', {
            event,
          })

          feed
            .get('queue')
            .get(eventId)
            .put(null)
          return event
        default:
          break
      }
    }

    date = new Date(date)

    // force valid dates
    date = isValidDate(date) ? date : new Date()
    let day = `${date.toISOString().slice(0, 10)}`

    //check if we need to update the day index location
    if (previouseventDate) {
      let prevdate = new Date(previouseventDate)
      prevdate = isValidDate(prevdate) ? prevdate : date
      let prevday = `${prevdate.toISOString().slice(0, 10)}`
      if (day !== prevday) {
        let dayEventsArr =
          (await feed.get(prevday).then(data => (typeof data === 'string' ? JSON.parse(data) : data))) || []
        let removePos = dayEventsArr.findIndex(e => e.id === event.id)
        if (removePos >= 0) {
          dayEventsArr.splice(removePos, 1)
          feed.get(prevday).put(JSON.stringify(dayEventsArr))
          feed
            .get('index')
            .get(prevday)
            .put(dayEventsArr.length)
        }
      }
    }

    // Update dates index
    let dayEventsArr = (await feed.get(day).then(data => (typeof data === 'string' ? JSON.parse(data) : data))) || []
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

    logger.debug('updateFeedEvent starting encrypt')

    // Saving eventFeed by id
    const eventAck = this.writeFeedEvent(event).catch(e => {
      logger.error('updateFeedEvent failedEncrypt byId:', e.message, e, {
        event,
      })

      return { err: e.message }
    })

    const saveDayIndexPtr = feed.get(day).putAck(JSON.stringify(dayEventsArr))

    const saveDaySizePtr = feed
      .get('index')
      .get(day)
      .putAck(dayEventsArr.length)

    const saveAck =
      saveDayIndexPtr && saveDayIndexPtr.then().catch(e => logger.error('updateFeedEvent dayIndex', e.message, e))

    const ack =
      saveDaySizePtr && saveDaySizePtr.then().catch(e => logger.error('updateFeedEvent daySize', e.message, e))

    if (saveDayIndexPtr || saveDaySizePtr) {
      logger.info('updateFeedEvent: Gun drain in process', {
        saveDayIndexPtr,
        saveDaySizePtr,
      })
    }

    return Promise.all([saveAck, ack, eventAck])
      .then(() => event)
      .catch(gunError => {
        const e = this._gunException(gunError)

        logger.error('Save Indexes failed', e.message, e)
      })
  }

  /**
   * get transaction id from one time payment link code
   * when a transaction to otpl is made and has the "code" field we index by it.
   * @param {string} hashedCode sha3 of the code
   * @returns transaction id that generated the code
   */
  getTransactionHashByCode(hashedCode: string): Promise<string> {
    return this.feed
      .get('codeToTxHash')
      .get(hashedCode)
      .then()
  }

  /**
   * Saves block number in the 'lastBlock' node
   * @param blockNumber
   * @returns {Promise<Promise<*>|Promise<R|*>>}
   */
  saveLastBlockNumber(blockNumber: number | string): Promise<any> {
    logger.debug('saving lastBlock:', blockNumber)
    return this.userProperties.set('lastBlock', blockNumber)
  }

  /**
   * Saves block number right after user registered
   *
   * @returns {void}
   */
  async saveJoinedBlockNumber(): void {
    // default block to start sync from
    const blockNumber = await this.wallet.wallet.eth
      .getBlockNumber()
      .catch(e => UserProperties.defaultProperties.joinedAtBlock)

    logger.debug('Saving lastBlock number right after registration:', blockNumber)

    return this.userProperties.updateAll({
      joinedAtBlock: blockNumber,
      lastBlock: blockNumber,
      lastTxSyncDate: moment().valueOf(),
    })
  }

  async getProfile(): Promise<any> {
    const encryptedProfile = await this.loadGunField(this.profile)

    if (encryptedProfile === undefined) {
      logger.error('getProfile: profile node undefined', '', new Error('Profile node undefined'))

      return {}
    }

    return this.getPrivateProfile(encryptedProfile)
  }

  loadGunField(gunNode): Promise<any> {
    return new Promise(async res => {
      gunNode.load(p => res(p))
      let isNode = await gunNode
      if (isNode === undefined) {
        res(undefined)
      }
    })
  }

  getEncryptedProfile(profileNode): Promise<> {
    return this.loadGunField(profileNode)
  }

  async getPublicProfile(): Promise<any> {
    const encryptedProfile = await this.loadGunField(this.profile)

    if (encryptedProfile === undefined) {
      const error = new Error('Profile node undefined')

      logger.error('getPublicProfile: profile node undefined', error.message, error)

      return {}
    }

    return this.getDisplayProfile(encryptedProfile)
  }

  getFaceIdentifier(): string {
    return this.wallet.getAccountForType('faceVerification').replace('0x', '')
  }

  /**
   * Checks if the current user was already registered to gunDB
   * @returns {Promise<boolean>|Promise<boolean>}
   */
  async userAlreadyExist(): Promise<boolean> {
    const gunNode = this.gunuser.get('registered')
    const exists = await gunNode.then(null, 1000)

    logger.debug('userAlreadyExist', { exists })
    return exists
  }

  /**
   * @private
   */
  _getProfileFields = profile => keys(profile).filter(field => !['_', 'initialized'].includes(field))

  /**
   * remove user from indexes
   * deleting profile actually doenst delete but encrypts everything
   */
  async deleteProfile(): Promise<boolean> {
    this.unSubscribeProfileUpdates()

    // first delete from indexes then delete the profile itself
    const { profile, _getProfileFields } = this
    let profileFields = await profile.then(_getProfileFields)

    logger.debug('Deleting profile fields', profileFields)

    await Promise.all(
      profileFields.map(field =>
        retry(() => this.setProfileFieldPrivacy(field, 'private'), 1).catch(exception => {
          let error = exception
          let { message } = error || {}

          if (!error) {
            error = new Error('Deleting profile field failed')
            message = 'Some error occurred during setting the privacy to the field'
          }

          logger.error('Deleting profile field failed', message, error, { index: field })
        }),
      ),
    )

    return true
  }

  /**
   * Delete the user account.
   * Deleting gundb profile and clearing local storage
   * Calling the server to delete their data
   */
  async deleteAccount(): Promise<boolean> {
    let deleteResults = false
    let deleteAccountResult
    const { wallet, userProperties, gunuser, _trackStatus } = this

    try {
      const faceIdentifier = this.getFaceIdentifier()
      const signature = await wallet.sign(faceIdentifier, 'faceVerification')

      await FaceVerificationAPI.disposeFaceSnapshot(faceIdentifier, signature)
      deleteAccountResult = await API.deleteAccount()

      if (get(deleteAccountResult, 'data.ok', false)) {
        deleteResults = await Promise.all([
          _trackStatus(retry(() => wallet.deleteAccount(), 1, 500), 'wallet'),
          _trackStatus(this.deleteProfile(), 'profile'),
          _trackStatus(userProperties.reset(), 'userprops'),
          _trackStatus(gunuser.get('registered').putAck(false), 'registered'),
        ])
      }
    } catch (e) {
      logger.error('deleteAccount unexpected error', e.message, e)
      return false
    }

    logger.debug('deleteAccount', deleteResults)
    return true
  }

  _gunException(gunError) {
    let exception = gunError

    if (!isError(exception)) {
      exception = new Error(gunError.err || gunError)
    }

    return exception
  }

  _trackStatus = (promise, label) =>
    promise
      .then(() => {
        const status = { [label]: 'ok' }

        logger.debug('Cleanup:', status)
        return status
      })
      .catch(gunError => {
        const status = { [label]: 'failed' }
        const e = this._gunException(gunError)

        logger.debug('Cleanup:', e.message, e, status)
        return status
      })
}
