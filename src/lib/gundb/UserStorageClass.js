//@flow
import Mutex from 'await-mutex'
import find from 'lodash/find'
import flatten from 'lodash/flatten'
import isEqual from 'lodash/isEqual'
import keys from 'lodash/keys'
import maxBy from 'lodash/maxBy'
import merge from 'lodash/merge'
import orderBy from 'lodash/orderBy'
import takeWhile from 'lodash/takeWhile'
import toPairs from 'lodash/toPairs'
import values from 'lodash/values'
import get from 'lodash/get'
import isEmail from 'validator/lib/isEmail'
import moment from 'moment'
import Gun from 'gun'
import SEA from 'gun/sea'
import Config from '../../config/config'
import API from '../API/api'
import pino from '../logger/pino-logger'
import isMobilePhone from '../validators/isMobilePhone'
import resizeBase64Image from '../utils/resizeBase64Image'
import defaultGun from './gundb'

import UserProperties from './UserPropertiesClass'
import { getUserModel, type UserModel } from './UserModel'

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

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

/**
 * StandardFeed element. It's being used to show the feed on dashboard
 * @type
 */
export type StandardFeed = {
  id: string,
  date: number,
  type: string, // 'message' | 'withdraw' | 'send',
  data: {
    endpoint: {
      address: string,
      fullName: string,
      avatar?: string,
    },
    amount: string,
    message: string,
  },
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
    customName: 'Welcome to GoodDollar',
    subtitle: 'Welcome to GoodDollar',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'GoodDollar is a digital coin with built-in\nbasic income. Start collecting your income by claiming GoodDollars every day.',
    endpoint: {
      fullName: 'Welcome to GoodDollar',
    },
  },
}

export const welcomeMessageOnlyEtoro = {
  id: '1',
  type: 'welcome',
  status: 'completed',
  data: {
    customName: 'Welcome to GoodDollar!',
    subtitle: 'Welcome to GoodDollar',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'Start collecting your income by claiming GoodDollars every day. Since this is a test version - all coins are “play” coins and have no value outside of this pilot, you can use them to buy goods during the trail, at the end of it, they will be returned to the system.',
    endpoint: {
      fullName: 'Welcome to GoodDollar',
    },
  },
}

export const inviteFriendsMessage = {
  id: '0',
  type: 'invite',
  status: 'completed',
  data: {
    customName: 'Invite friends and earn G$',
    subtitle: 'Want to earn more G$ ?',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'Help expand the network by inviting family, friends, and colleagues to participate and claim their daily income.\nThe more people join, the more effective GoodDollar will be, for everyone.',
    endpoint: {
      fullName: 'Invite friends and earn G$',
    },
  },
}
export const backupMessage = {
  id: '2',
  type: 'backup',
  status: 'completed',
  data: {
    customName: 'Backup your wallet. Now.',
    subtitle: 'You need to backup your',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'Your pass phrase is the only key to your wallet, this is why our wallet is super secure. Only you have access to your wallet and money. But if you won’t backup your pass phrase or if you lose it — you won’t be able to access your wallet and all your money will be lost forever.',
    endpoint: {
      fullName: 'Backup your wallet. Now.',
    },
  },
}

export const startSpending = {
  id: '3',
  type: 'spending',
  status: 'completed',
  data: {
    customName: 'Go to GoodMarket',
    subtitle: "Start spending your G$'s",
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'Visit GoodMarket, eToro’s exclusive marketplace, where you can buy or sell items in exchange for GoodDollars.',
    endpoint: {
      fullName: 'Go to GoodMarket',
    },
  },
}

export const startClaiming = {
  id: '4',
  type: 'claiming',
  status: 'completed',
  data: {
    customName: 'Start claiming your free daily G$',
    subtitle: 'Start claiming your free daily G$',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'GoodDollar gives every active member a small daily income. Sign in every day, collect free GoodDollars and use them to pay for goods and services.',
    endpoint: {
      fullName: 'Start claiming your free daily G$',
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
        { name: log.name }
      )
    )

  //maxBy is used in case transaction also paid a TX fee/burn, so since they are small
  //it filters them out
  const transferLog = maxBy(
    logs.filter(log => {
      return log && log.name === CONTRACT_EVENT_TYPE_TRANSFER
    }),
    'value'
  )
  const withdrawLog = logs.find(log => {
    return log && (log.name === CONTRACT_EVENT_TYPE_PAYMENT_WITHDRAW || log.name === CONTRACT_EVENT_TYPE_PAYMENT_CANCEL)
  })
  logger.debug('getReceiveDataFromReceipt', { logs: receipt.logs, transferLog, withdrawLog })
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
  gunuser: Gun

  /**
   * a gun node referring to gun
   * @instance {Gun}
   */
  gun: Gun

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {Gun}
   */
  properties: Gun

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {UserProperties}
   */
  userProperties: UserProperties

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
   * current feed item
   */
  cursor: number = 0

  /**
   * In memory array. keep number of events per day
   * @instance {Gun}
   */
  feedIndex: Array<[Date, number]>

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

  /**
   * Clean string removing blank spaces and special characters, and converts to lower case
   *
   * @param {string} field - Field name
   * @param {string} value - Field value
   * @returns {string} - Value without '+' (plus), '-' (minus), '_' (underscore), ' ' (space), in lower case
   */
  static cleanFieldForIndex = (field: string, value: string): string => {
    if (value === undefined) {
      return value
    }
    if (field === 'mobile' || field === 'phone') {
      return value.replace(/[_+-\s]+/g, '')
    }
    return `${value}`.toLowerCase()
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
  static async getMnemonic(username: String, password: String): String {
    let gun = defaultGun
    let gunuser = gun.user()
    let mnemonic = ''

    const authUserInGun = (username, password) => {
      return new Promise((res, rej) => {
        gunuser.auth(username, password, user => {
          logger.debug('gundb auth', user.err)
          if (user.err) {
            logger.error('Error getMnimonic UserStorage', user.err)
            return rej(false)
          }
          res(true)
        })
      })
    }

    if (await authUserInGun(username, password)) {
      const profile = gunuser.get('profile')
      mnemonic = await profile
        .get('mnemonic')
        .get('value')
        .decrypt()
    }
    await gunuser.leave()

    return mnemonic
  }

  constructor(wallet: GoodWallet, gun: Gun = defaultGun) {
    this.gun = gun
    this.wallet = wallet
    this.ready = this.wallet.ready
      .then(() => this.init())
      .then(() => logger.debug('userStorage initialized.'))
      .catch(e => {
        logger.error('Error initializing UserStorage', e.message, e, { account: this.wallet.account })
        return false
      })
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
  async init() {
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
      w3Token: { defaultPrivacy: 'private' },
      loginToken: { defaultPrivacy: 'private' },
    }

    //sign with different address so its not connected to main user address and there's no 1-1 link
    const username = await this.wallet.sign('GoodDollarUser', 'gundb').then(r => r.slice(0, 20))
    const password = await this.wallet.sign('GoodDollarPass', 'gundb').then(r => r.slice(0, 20))
    this.gunuser = this.gun.user()
    if (this.gunuser.is) {
      logger.debug('init:', 'logging out first')
      this.gunuser.leave()
    }

    // this causes gun create user only on non-incognito to hang if user doesnt exists i have no freaking idea why
    //const existingUsername = await this.gun.get('~@' + username)
    const existingUsername = false
    logger.debug('init existing username:', { existingUsername })
    let loggedInPromise
    if (existingUsername) {
      loggedInPromise = this.gunAuth(username, password).catch(e =>
        this.gunCreate(username, password).then(r => this.gunAuth(username, password))
      )
    } else {
      loggedInPromise = this.gunCreate(username, password).then(r => this.gunAuth(username, password))
    }
    this.magiclink = this.createMagicLink(username, password)

    return new Promise(async (res, rej) => {
      let user = await loggedInPromise.catch(e => rej(e))
      if (user === undefined) {
        return
      }
      this.user = this.gunuser.is
      this.profile = this.gunuser.get('profile')
      this.profile.open(doc => {
        this._lastProfileUpdate = doc
        this.subscribersProfileUpdates.forEach(callback => callback(doc))
      })
      logger.debug('init to events')

      this.initFeed()
      await this.initProperties()

      //save ref to user
      this.gun
        .get('users')
        .get(this.gunuser.is.pub)
        .put(this.gunuser)
      logger.debug('GunDB logged in', { username, pubkey: this.wallet.account })
      logger.debug('subscribing')

      this.wallet.subscribeToEvent(EVENT_TYPE_RECEIVE, event => {
        logger.debug({ event }, EVENT_TYPE_RECEIVE)
      })
      this.wallet.subscribeToEvent(EVENT_TYPE_SEND, event => {
        logger.debug({ event }, EVENT_TYPE_SEND)
      })
      this.wallet.subscribeToEvent('otplUpdated', receipt => this.handleOTPLUpdated(receipt))
      this.wallet.subscribeToEvent('receiptUpdated', receipt => this.handleReceiptUpdated(receipt))
      this.wallet.subscribeToEvent('receiptReceived', receipt => this.handleReceiptUpdated(receipt))
      res(true)
    })
  }

  setAvatar(avatar) {
    return Promise.all([
      this.setProfileField('avatar', avatar, 'public'),
      async () => {
        const smallAvatar = await resizeBase64Image(avatar, 50)
        return this.setProfileField('smallAvatar', smallAvatar, 'public')
      },
    ])
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
    magicLink = Buffer.from(magicLink).toString('base64')

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

  async handleReceiptUpdated(receipt: any): Promise<FeedEvent> {
    //receipt received via websockets/polling need mutex to prevent race
    //with enqueing the initial TX data
    const data = getReceiveDataFromReceipt(receipt)
    if (
      data.name === CONTRACT_EVENT_TYPE_PAYMENT_CANCEL ||
      (data.name === CONTRACT_EVENT_TYPE_PAYMENT_WITHDRAW && data.from === data.to)
    ) {
      logger.debug('handleReceiptUpdated: skipping self withdrawn payment link (cancelled)', { data, receipt })
      return {}
    }
    const release = await this.feedMutex.lock()
    try {
      logger.debug('handleReceiptUpdated', { data, receipt })

      //get initial TX data from queue, if not in queue then it must be a receive TX ie
      //not initiated by user
      //other option is that TX was processed on another wallet instance
      const initialEvent = (await this.dequeueTX(receipt.transactionHash)) || { data: {} }
      logger.debug('handleReceiptUpdated got enqueued event:', { id: receipt.transactionHash, initialEvent })

      const receiptDate = await this.wallet.wallet.eth
        .getBlock(receipt.blockNumber)
        .then(_ => new Date(_.timestamp * 1000))
        .catch(_ => new Date())

      //get existing or make a new event
      const feedEvent = (await this.getFeedItemByTransactionHash(receipt.transactionHash)) || {
        id: receipt.transactionHash,
        createdDate: receiptDate.toString(),
        type: this.getOperationType(data, this.wallet.account),
      }

      if (get(feedEvent, 'data.receiptData')) {
        logger.debug('handleReceiptUpdated skipping event with existed receipt data', feedEvent, receipt)
        return feedEvent
      }

      //merge incoming receipt data into existing event
      const updatedFeedEvent: FeedEvent = {
        ...feedEvent,
        ...initialEvent,
        status: feedEvent.otplStatus === 'cancelled' ? feedEvent.status : receipt.status ? 'completed' : 'error',
        date: receiptDate.toString(),
        data: {
          ...feedEvent.data,
          ...initialEvent.data,
          receiptData: data,
        },
      }

      if (feedEvent.type === EVENT_TYPE_BONUS && receipt.status) {
        updatedFeedEvent.data.message = COMPLETED_BONUS_REASON_TEXT
        updatedFeedEvent.data.customName = 'GoodDollar'
      }

      logger.debug('handleReceiptUpdated receiptReceived', { initialEvent, feedEvent, receipt, data, updatedFeedEvent })

      if (isEqual(feedEvent, updatedFeedEvent) === false) {
        await this.updateFeedEvent(updatedFeedEvent, feedEvent.date)
      }

      return updatedFeedEvent
    } catch (e) {
      logger.error('handleReceiptUpdated failed', e.message, e)
    } finally {
      release()
    }
    return {}
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
      const originalTXHash = await this.getTransactionHashByCode(data.hash)
      if (originalTXHash === undefined) {
        logger.error(
          'handleOTPLUpdated: Original payment link TX not found',
          '',
          new Error('handleOTPLUpdated failed'),
          data
        )
        return
      }
      const feedEvent = await this.getFeedItemByTransactionHash(originalTXHash)

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
      logger.debug('handleOTPLUpdated receiptReceived', { feedEvent, otplStatus, receipt, data })
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
    return this.feed
      .get('byid')
      .get(transactionHash)
      .decrypt()
      .catch(e => {
        logger.warn('getFeedItemByTransactionHash not found or cant decrypt', { transactionHash })
        return undefined
      })
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
    let dayToNumEvents: Array<[string, number]> = toPairs(changed)
    this.feedIndex = orderBy(dayToNumEvents, day => day[0], 'desc')
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

  async startSystemFeed() {
    const userProperties = await this.userProperties.getAll()
    const firstVisitAppDate = userProperties.firstVisitApp
    const isCameFromW3Site = userProperties.cameFromW3Site

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

      if (!isCameFromW3Site) {
        setTimeout(() => {
          this.enqueueTX(inviteFriendsMessage)
        }, 2 * 60 * 1000) // 2 minutes
      }

      await this.userProperties.set('firstVisitApp', Date.now())
    }
  }

  /**
   * Save user properties
   */
  async initProperties() {
    this.properties = this.gunuser.get('properties')

    if ((await this.properties) === undefined) {
      let putRes = await this.properties.putAck(UserProperties.defaultProperties)
      logger.debug('set defaultProperties ok:', { defaultProperties: UserProperties.defaultProperties, putRes })
    }
    this.userProperties = new UserProperties(this.properties)
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

    if (!userProperties.isMadeBackup && allowToShowByTimeFilter) {
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
    const userProperties = await this.userProperties.getAll()
    const firstVisitAppDate = userProperties.firstVisitApp
    const displayTimeFilter = Config.displayStartClaimingCardTime
    const allowToShowByTimeFilter = firstVisitAppDate && Date.now() - firstVisitAppDate >= displayTimeFilter

    if (allowToShowByTimeFilter) {
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

  async getFieldPrivacy(field) {
    const currentPrivacy = await this.profile.get(field).get('privacy')

    return currentPrivacy || this.profileSettings[field].defaultPrivacy || 'public'
  }

  /**
   * Save profile with all validations and indexes
   * It saves only known profile fields
   *
   * @param {UserModel} profile - User profile
   * @param {boolean} update - are we updating, if so validate only non empty fields
   * @returns {Promise} Promise with profile settings updates and privacy validations
   * @throws Error if profile is invalid
   */
  async setProfile(profile: UserModel, update: boolean = false): Promise<> {
    if (profile && !profile.validate) {
      profile = getUserModel(profile)
    }
    const { errors, isValid } = profile.validate(update)
    if (!isValid) {
      logger.error('setProfile failed:', '', new Error('setProfile failed'), errors)
      if (Config.throwSaveProfileErrors) {
        return Promise.reject(errors)
      }
    }

    if (profile.avatar) {
      profile.smallAvatar = await resizeBase64Image(profile.avatar, 50)
    }

    return Promise.all(
      keys(this.profileSettings)
        .filter(key => profile[key])
        .map(async field => {
          return this.setProfileField(field, profile[field], await this.getFieldPrivacy(field)).catch(e => {
            logger.error('setProfile field failed:', e.message, e, field)
            return { err: `failed saving field ${field}` }
          })
        })
    ).then(results => {
      const errors = results.filter(ack => ack && ack.err).map(ack => ack.err)
      if (errors.length > 0) {
        logger.error('setProfile some fields failed', errors.length, errors, JSON.stringify(errors))
        if (Config.throwSaveProfileErrors) {
          return Promise.reject(errors)
        }
      }
      return true
    })
  }

  /**
   *
   * @param {string} field
   * @param {string} value
   * @param {string} privacy
   * @returns {boolean}
   */
  static async isValidValue(field: string, value: string) {
    const cleanValue = UserStorage.cleanFieldForIndex(field, value)

    if (!cleanValue) {
      logger.error(
        `indexProfileField - field ${field} value is empty (value: ${value})`,
        cleanValue,
        new Error('isValidValue failed')
      )
      return false
    }

    try {
      const indexValue = await global.gun
        .get(`users/by${field}`)
        .get(cleanValue)
        .then()
      return !(indexValue && indexValue.pub !== global.gun.user().is.pub)
    } catch (e) {
      logger.error('indexProfileField', e.message, e)
      return true
    }
  }

  async validateProfile(profile: any) {
    if (!profile) {
      return { isValid: false, errors: {} }
    }
    const fields = Object.keys(profile).filter(prop => UserStorage.indexableFields[prop])

    const validatedFields = await Promise.all(
      fields.map(async field => ({ field, valid: await UserStorage.isValidValue(field, profile[field]) }))
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
    onlyPrivacy: boolean = false
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
    if (onlyPrivacy) {
      return this.profile.get(field).putAck({
        display,
        privacy,
      })
    }

    return Promise.race([
      this.profile
        .get(field)
        .get('value')
        .secretAck(value),
      this.profile.get(field).putAck({
        display,
        privacy,
      }),
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
    const cleanValue = UserStorage.cleanFieldForIndex(field, value)
    if (!cleanValue) {
      return Promise.resolve({ err: 'Indexable field cannot be null or empty', ok: 0 })
    }

    try {
      if (field === 'username' && !(await UserStorage.isValidValue(field, value))) {
        return Promise.resolve({ err: `Existing index on field ${field}`, ok: 0 })
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

      if (privacy !== 'public' && indexValue !== undefined) {
        return indexNode.putAck(null)
      }

      return indexNode.putAck(this.gunuser)
    } catch (e) {
      logger.error('indexProfileField', e.message, e)

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

    //TODO: WTF does this work?!?! if we JSON.stringify teh day index content how come we don't need to JSON.parse it?
    //this works in the unit tests also
    let promises: Array<Promise<Array<FeedEvent>>> = daysToTake.map(day => {
      return this.feed
        .get(day[0])
        .then()
        .catch(e => {
          logger.error('getFeed', e.message, e)
          return []
        })
    })

    const eventsIndex = flatten(await Promise.all(promises))
    return Promise.all(
      eventsIndex
        .filter(_ => _.id)
        .map(async eventIndex => {
          let item = this.feed
            .get('byid')
            .get(eventIndex.id)
            .decrypt()

          if (item === undefined) {
            const receipt = await this.wallet.getReceiptWithLogs(eventIndex.id).catch(e => {
              logger.warn('no receipt found for id:', eventIndex.id, e.message, e)
              return undefined
            })

            if (receipt) {
              item = await this.handleReceiptUpdated(receipt)
            }
          }

          return item
        })
    )
  }

  /**
   * Return all feed events*
   * @returns {Promise} Promise with array of standarised feed events
   * @todo Add pagination
   */
  async getFormattedEvents(numResults: number, reset?: boolean): Promise<Array<StandardFeed>> {
    const feed = await this.getFeedPage(numResults, reset)

    return Promise.all(
      feed
        .filter(
          feedItem =>
            feedItem.data && ['deleted', 'cancelled'].includes(feedItem.status || feedItem.otplStatus) === false
        )
        .map(feedItem => {
          if (!(feedItem.data && feedItem.data.receiptData)) {
            return this.getFormatedEventById(feedItem.id)
          }

          return this.formatEvent(feedItem).catch(e => {
            logger.error('getFormattedEvents Failed formatting event:', e.message, e, feedItem)
            return {}
          })
        })
    )
  }

  async getFormatedEventById(id: string): Promise<StandardFeed> {
    const prevFeedEvent = await this.getFeedItemByTransactionHash(id)
    const standardPrevFeedEvent = await this.formatEvent(prevFeedEvent).catch(e => {
      logger.error('getFormatedEventById Failed formatting event:', e.message, e, id)
      return undefined
    })
    if (!prevFeedEvent) {
      return standardPrevFeedEvent
    }
    if (prevFeedEvent.data && prevFeedEvent.data.receiptData) {
      return standardPrevFeedEvent
    }

    logger.warn('getFormatedEventById: receipt data missing for:', { id, standardPrevFeedEvent })

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
    logger.debug('getFormatedEventById updated event with receipt', { prevFeedEvent, updatedEvent })
    return this.formatEvent(updatedEvent).catch(e => {
      logger.error('getFormatedEventById Failed formatting event:', id, e.message, e)
      return {}
    })
  }

  /**
   * Checks if username connected to a profile
   * @param {string} username
   */
  async isUsername(username: string) {
    const profile = await this.gun.get('users/byusername').get(username)
    return profile !== undefined
  }

  /**
   * Save survey
   * @param {string} hash
   * @param {object} details
   * @returns {Promise<void>}
   */
  saveSurveyDetails(hash, details: SurveyDetails) {
    try {
      const date = moment(new Date()).format('DDMMYY')
      this.gun
        .get('survey')
        .get(date)
        .get(hash)
        .put(details)
      return true
    } catch (e) {
      logger.error('saveSurveyDetails :', e.message, e, details)
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
  async getUserProfile(field: string = '') {
    const attr = isMobilePhone(field) ? 'mobile' : isEmail(field) ? 'email' : 'walletAddress'
    const value = UserStorage.cleanFieldForIndex(attr, field)

    const profileToShow = this.gun
      .get(`users/by${attr}`)
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
  async formatEvent(event: FeedEvent): Promise<StandardFeed> {
    logger.debug('formatEvent: incoming event', event.id, { event })

    try {
      const { data, type, date, id, status, createdDate } = event
      const { sender, reason, code: withdrawCode, otplStatus, customName, subtitle } = data

      const { address, initiator, initiatorType, value, displayName, message } = this._extractData(event)
      const withdrawStatus = this._extractWithdrawStatus(withdrawCode, otplStatus, status)
      const displayType = this._extractDisplayType(type, withdrawStatus, status)
      logger.debug('formatEvent:', event.id, { initiatorType, initiator, address })
      const profileNode = this._extractProfileToShow(initiatorType, initiator, address)
      const [avatar, fullName] = await Promise.all([
        this._extractAvatar(type, withdrawStatus, profileNode, address).catch(e => {
          logger.warn('formatEvent: failed extractAvatar', e.message, e, {
            type,
            withdrawStatus,
            profileNode,
            address,
          })
          return undefined
        }),
        this._extractFullName(customName, profileNode, initiatorType, initiator, type, address, displayName).catch(
          e => {
            logger.warn('formatEvent: failed extractFullName', e.message, e, {
              customName,
              profileNode,
              initiatorType,
              initiator,
              type,
              address,
              displayName,
            })
            return undefined
          }
        ),
      ])

      return {
        id,
        date: new Date(date).getTime(),
        type,
        displayType,
        status,
        createdDate,
        data: {
          endpoint: {
            address: sender,
            fullName,
            avatar,
            withdrawStatus,
          },
          amount: value,
          message: reason || message,
          subtitle,
          withdrawCode,
        },
      }
    } catch (e) {
      logger.error('formatEvent: failed formatting event:', e.message, e, event)
      return {}
    }
  }

  _extractData({ type, id, data: { receiptData, from = '', to = '', counterPartyDisplayName = '', amount } }) {
    const { isAddress } = this.wallet.wallet.utils
    const data = { address: '', initiator: '', initiatorType: '', value: '', displayName: '', message: '' }

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
    data.address = data.address && UserStorage.cleanFieldForIndex('walletAddress', data.address)
    data.value = (receiptData && receiptData.value) || amount
    data.displayName = counterPartyDisplayName || 'Unknown'

    logger.debug('formatEvent: parsed data', { id, type, to, counterPartyDisplayName, from, receiptData, ...data })

    return data
  }

  _extractWithdrawStatus(withdrawCode, otplStatus = 'pending', status) {
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

  _extractProfileToShow(initiatorType, initiator, address): Gun {
    const getProfile = (group, value) =>
      this.gun
        .get(group)
        .get(value)
        .get('profile')

    const searchField = initiatorType && `by${initiatorType}`
    const byIndex = searchField && getProfile(`users/${searchField}`, initiator)
    const byAddress = address && getProfile(`users/bywalletAddress`, address)

    // const [profileByIndex, profileByAddress] = await Promise.all([byIndex, byAddress])

    return byIndex || byAddress
  }

  async _extractAvatar(type, withdrawStatus, profileToShow, address) {
    const favicon = `${process.env.PUBLIC_URL}/favicon-96x96.png`
    const profileFromGun = () =>
      profileToShow &&
      profileToShow
        .get('smallAvatar')
        .get('display')
        .then()

    return (
      (type === EVENT_TYPE_BONUS && favicon) ||
      (((type === EVENT_TYPE_SEND && withdrawStatus === 'error') ||
        (type === EVENT_TYPE_WITHDRAW && withdrawStatus === 'error')) &&
        favicon) || // errored send/withdraw
      (await profileFromGun()) || // extract avatar from profile
      (type === EVENT_TYPE_CLAIM || address === '0x0000000000000000000000000000000000000000' ? favicon : undefined)
    )
  }

  async _extractFullName(customName, profileToShow, initiatorType, initiator, type, address, displayName) {
    const profileFromGun = () =>
      profileToShow &&
      profileToShow
        .get('fullName')
        .get('display')
        .then()

    return (
      customName || // if customName exist, use it
      (await profileFromGun()) || // if there's a profile, extract it's fullName
      (initiatorType && initiator) ||
      (type === EVENT_TYPE_CLAIM || address === '0x0000000000000000000000000000000000000000'
        ? 'GoodDollar'
        : displayName)
    )
  }

  /**
   * enqueue a new pending TX done on DAPP, to be later merged with the blockchain tx
   * the DAPP event can contain more details than the blockchain tx event
   * @param {FeedEvent} event
   * @returns {Promise<>}
   */
  async enqueueTX(event: FeedEvent): Promise<> {
    //a race exists between enqueing and receipt from websockets/polling
    const release = await this.feedMutex.lock()
    try {
      const existingEvent = await this.feed
        .get('byid')
        .get(event.id)
        .then()
        .catch(_ => false)
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
        .putAck(event)
      await this.updateFeedEvent(event)
      logger.debug('enqueueTX ok:', { event, putRes })
      return true
    } catch (e) {
      logger.error('enqueueTX failed: ', e.message, e)
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
      const feedItem = await this.loadGunField(this.feed.get('queue').get(eventId))
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

    return this.feed
      .get('byid')
      .get(eventId)
      .secretAck(feedEvent)
      .then()
      .then(_ => feedEvent)
      .catch(e => {
        logger.error('updateEventStatus failedEncrypt byId:', e.message, e, feedEvent)
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

    return this.feed
      .get('byid')
      .get(eventId)
      .secretAck(feedEvent)
      .then()
      .then(_ => feedEvent)
      .catch(e => {
        logger.error('updateOTPLEventStatus failedEncrypt byId:', e.message, e, feedEvent)
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
    if (event.type === EVENT_TYPE_SEND && event.data.code) {
      const hashedCode = this.wallet.wallet.utils.sha3(event.data.code)
      this.feed.get('codeToTxHash').put({ [hashedCode]: event.id })
    } else if (event.type === 'withdraw' && event.data.code) {
      //are we withdrawing our own link?
      const hashedCode = this.wallet.wallet.utils.sha3(event.data.code)
      const ownlink = await this.feed.get('codeToTxHash').get(hashedCode)
      if (ownlink) {
        logger.debug('updateFeedEvent: skipping own link withdraw', { event })
        this.feed
          .get('queue')
          .get(event.id)
          .put(null)
        return event
      }
    }

    let date = new Date(event.date)

    // force valid dates
    date = isValidDate(date) ? date : new Date()
    let day = `${date.toISOString().slice(0, 10)}`

    //check if we need to update the day index location
    if (previouseventDate) {
      let prevdate = new Date(previouseventDate)
      prevdate = isValidDate(prevdate) ? prevdate : date
      let prevday = `${prevdate.toISOString().slice(0, 10)}`
      if (day !== prevday) {
        let dayEventsArr = (await this.feed.get(prevday)) || []
        let removePos = dayEventsArr.findIndex(e => e.id === event.id)
        if (removePos >= 0) {
          dayEventsArr.splice(removePos, 1)
          this.feed.get(prevday).put(JSON.stringify(dayEventsArr))
          this.feed
            .get('index')
            .get(prevday)
            .put(dayEventsArr.length)
        }
      }
    }

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

    logger.debug('updateFeedEvent starting encrypt')

    // Saving eventFeed by id
    const eventAck = this.feed
      .get('byid')
      .get(event.id)
      .secretAck(event)
      .then()
      .catch(e => {
        logger.error('updateFeedEvent failedEncrypt byId:', e.message, e, event)
        return { err: e.message }
      })
    const saveDayIndexPtr = this.feed.get(day).putAck(JSON.stringify(dayEventsArr))
    const saveDaySizePtr = this.feed
      .get('index')
      .get(day)
      .putAck(dayEventsArr.length)

    const saveAck =
      saveDayIndexPtr && saveDayIndexPtr.then().catch(e => logger.error('updateFeedEvent dayIndex', e.message, e))
    const ack =
      saveDaySizePtr && saveDaySizePtr.then().catch(e => logger.error('updateFeedEvent daySize', e.message, e))

    if (saveDayIndexPtr || saveDaySizePtr) {
      logger.info('updateFeedEvent: Gun drain in process', { saveDayIndexPtr, saveDaySizePtr })
    }

    return Promise.all([saveAck, ack, eventAck])
      .then(() => event)
      .catch(e => logger.error('savingIndex', e.message, e))
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

  async getProfile(): Promise<any> {
    const encryptedProfile = await this.loadGunField(this.profile)
    if (encryptedProfile === undefined) {
      logger.error('getProfile: profile node undefined')
      return {}
    }
    const fullProfile = this.getPrivateProfile(encryptedProfile)
    return fullProfile
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
      logger.error('getPublicProfile: profile node undefined')
      return {}
    }
    const fullProfile = this.getDisplayProfile(encryptedProfile)
    return fullProfile
  }

  /**
   * Checks if the current user was already registered to gunDB
   * @returns {Promise<boolean>|Promise<boolean>}
   */
  async userAlreadyExist(): Promise<boolean> {
    const profile = await this.profile
    logger.debug('userAlreadyExist', this.profile !== undefined && profile !== undefined && profile !== null)
    return !!profile
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

    await this.gunuser.get('profile').putAck(null)

    return true
  }

  /**
   * Delete the user account.
   * Deleting gundb profile and clearing local storage
   * Calling the server to delete their data
   */
  async deleteAccount(): Promise<boolean> {
    const zoomId = await this.wallet.getAccountForType('zoomId').replace('0x', '')
    const zoomSignature = await this.wallet.sign(zoomId, 'zoomId')
    let deleteResults = false
    let deleteAccountResult

    try {
      deleteAccountResult = await API.deleteAccount(zoomId, zoomSignature)

      if (deleteAccountResult.data.ok) {
        deleteResults = await Promise.all([
          this.wallet
            .deleteAccount()
            .then(r => ({ wallet: 'ok' }))
            .catch(e => ({ wallet: 'failed' })),
          this.deleteProfile()
            .then(r => ({
              profile: 'ok',
            }))
            .catch(r => ({
              profile: 'failed',
            })),
          this.gunuser
            .get('feed')
            .putAck(null)
            .then(r => ({
              feed: 'ok',
            }))
            .catch(r => ({
              feed: 'failed',
            })),
          this.properties
            .putAck(null)
            .then(r => ({
              properties: 'ok',
            }))
            .catch(r => ({
              properties: 'failed',
            })),
        ])
      }
    } catch (e) {
      logger.error('deleteAccount unexpected error', e.message, e)
      return false
    }

    logger.debug('deleteAccount', { deleteResults })
    return true
  }
}
