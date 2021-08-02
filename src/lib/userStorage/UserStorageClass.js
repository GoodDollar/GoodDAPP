//@flow

import {
  assign,
  debounce,
  defaults,
  get,
  isEmpty,
  isError,
  isFunction,
  isNil,
  isString,
  keys,
  last,
  memoize,
  over,
  pick,
} from 'lodash'

import moment from 'moment'
import Gun from '@gooddollar/gun'
import SEA from '@gooddollar/gun/sea'
import { gunAuth as gunPKAuth } from '@gooddollar/gun-pk-auth'
import { sha3 } from 'web3-utils'
import isEmail from '../../lib/validators/isEmail'

import { retry } from '../utils/async'

import FaceVerificationAPI from '../../components/dashboard/FaceVerification/api/FaceVerificationApi'
import Config from '../../config/config'
import API from '../API/api'
import pino from '../logger/pino-logger'
import { ExceptionCategory } from '../logger/exceptions'
import isMobilePhone from '../validators/isMobilePhone'
import { AVATAR_SIZE, resizeImageRecord, SMALL_AVATAR_SIZE } from '../utils/image'
import { isValidCID } from '../utils/ipfs'

import { GD_GUN_CREDENTIALS } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'
import defaultGun from '../gundb/gundb'
import { getUserModel, type UserModel } from '../gundb/UserModel'
import { type StandardFeed } from '../gundb/StandardFeed'
import avatarStorage from './UserAvatarStorage'
import UserProperties from './UserProperties'
import { FeedEvent, FeedItemType, FeedStorage, TxStatus } from './FeedStorage'
import type { DB } from './UserStorage'

const logger = pino.child({ from: 'UserStorage' })

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

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
    counterPartyFullName: 'Welcome to GoodDollar!',
    subtitle: 'Welcome to GoodDollar!',
    readMore: 'Claim free G$ coins daily.',
    receiptEvent: {
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
    counterPartyFullName: 'Welcome to GoodDollar!',
    subtitle: 'Welcome to GoodDollar!',
    readMore: false,
    receiptEvent: {
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
    counterPartyFullName: `Invite friends and earn G$'s`,
    subtitle: 'Invite your friends now',
    readMore: 'Get 100G$ for each friend who signs up\nand they get 50G$!',
    receiptEvent: {
      from: NULL_ADDRESS,
    },
    reason:
      'Help expand the network by inviting family, friends, and colleagues to participate and claim their daily income.\nThe more people join, the more effective GoodDollar will be, for everyone.',
  },
  action: `navigate("Rewards")`,
}
export const INVITE_NEW_ID = '0.1'
export const INVITE_REMINDER_ID = '0.2'

export const backupMessage = {
  id: '2',
  type: 'backup',
  status: 'completed',
  data: {
    counterPartyFullName: 'Backup your wallet. Now.',
    subtitle: 'You need to backup your',
    readMore: 'wallet pass phrase.',
    receiptEvent: {
      from: NULL_ADDRESS,
    },
    reason:
      'Your pass phrase is the only key to your wallet, this is why our wallet is super secure. Only you have access to your wallet and money. But if you won’t backup your pass phrase or if you lose it — you won’t be able to access your wallet and all your money will be lost forever.',
  },
}

export const startClaiming = {
  id: '4',
  type: 'claiming',
  status: 'completed',
  data: {
    counterPartyFullName: `Claim your G$'s today!`, //title in modal
    subtitle: `Claim your G$'s today!`, //title in feed list
    readMore: false,
    receiptEvent: {
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
    counterPartyFullName: 'Woohoo! You’ve made it!', //title in modal
    subtitle: 'Woohoo! You’ve made it!',
    smallReadMore: 'Congrats! You claimed G$ for 14 days.',
    receiptEvent: {
      from: NULL_ADDRESS,
    },
    reason: `Nice work. You’ve claimed demo G$’s for\n14 days and your spot is now secured for\nGoodDollar’s live launch.\nLive G$ coins are coming your way soon!`,
    endpoint: {
      displayName: 'Congrats! You’ve made it!',
    },
  },
}

/**
 * Users gundb to handle user storage.
 * User storage is used to keep the user Self Sovereign Profile and his blockchain transaction history
 * @class
 *  */
export class UserStorage {
  /**
   * wallet an instance of GoodWallet
   * @instance {GoodWallet}
   */
  wallet: GoodWallet

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
   * current feed item
   */
  cursor: number = 0

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

  feedDB: DB

  userProperties

  profileSettings: {} = {
    fullName: { defaultPrivacy: 'public' },
    email: { defaultPrivacy: 'private' },
    mobile: { defaultPrivacy: 'private' },
    mnemonic: { defaultPrivacy: 'private' },
    avatar: { defaultPrivacy: 'public' },
    smallAvatar: { defaultPrivacy: 'public' },
    walletAddress: { defaultPrivacy: 'public' },
    username: { defaultPrivacy: 'public' },
  }

  /**
   * Object with default value for profile fields
   */
  profileDefaults: {} = {
    mobile: '',
  }

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

  walletAddressIndex = {}

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

  constructor(wallet: GoodWallet, feeddb: DB, userProperties) {
    this.gun = defaultGun
    this.wallet = wallet
    this.feedDB = feeddb
    this.userProperties = userProperties
    this.init()
  }

  /**
   * a gun node referring to gun.user().get('profile')
   * @instance {Gun}
   */
  get profile() {
    return this.gun.user().get('profile')
  }

  /**
   * a gun node referring to gun.user()
   * @instance {Gun}
   */
  get gunuser() {
    return this.gun.user()
  }

  /**
   * Convert to null, if value is equal to empty string
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @returns serialized value
   */
  serialize(field: string, value: any): any {
    const { profileDefaults } = this
    const defaultValue = profileDefaults[field]
    const hasDefaultValue = field in profileDefaults
    const isFieldEmpty = isString(value) && isEmpty(value)

    if (isFieldEmpty || (hasDefaultValue && value === defaultValue)) {
      return null
    }

    return value
  }

  /**
   * Parse null value with replace according to defaults profile values, otherwise return value
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @returns unserialized value
   */
  unserialize(field: string, value: any): any {
    const { profileDefaults } = this
    const defaultValue = profileDefaults[field]
    const hasDefaultValue = field in profileDefaults

    return isNil(value) && hasDefaultValue ? defaultValue : value
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
    logger.debug('init finished gun login', user)

    if (user === undefined) {
      throw new Error('gun login failed')
    }
    this.user = this.gunuser.is

    //try to make sure all gun SEA  decryption keys are preloaded
    this.gunuser.get('trust').load()

    logger.debug('GunDB logged in', {
      pubkey: this.gunuser.is,
      pair: this.gunuser.pair(),
    })

    this.initProfile().catch(e => logger.error('failed initializing initProfile', e.message, e))
  }

  /**
   * Initialize wallet, gundb user, feed and subscribe to events
   */
  async initRegistered() {
    logger.debug('Initializing GunDB UserStorage for registered user', this.initializedRegistered)

    if (this.initializedRegistered) {
      return
    }

    const seed = this.wallet.wallet.eth.accounts.wallet[this.wallet.getAccountForType('gundb')].privateKey.slice(2)
    await this.feedDB.init(seed, this.wallet.getAccountForType('gundb')) //only once user is registered he has access to realmdb via signed jwt
    await this.initFeed()

    // get trusted GoodDollar indexes and pub key
    let trustPromise = this.fetchTrustIndexes()

    logger.debug('subscribing to wallet events')

    await Promise.all([trustPromise])

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
        await this.userProperties.ready
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
      AsyncStorage.getItem('GD_walletIndex').then(idx => (this.walletAddressIndex = idx || {}))
      const { data, lastFetch } = (await AsyncStorage.getItem('GD_trust')) || {}

      let refetch = true

      if (lastFetch) {
        const stale = moment().diff(moment(lastFetch), 'days')
        refetch = stale >= 7
        logger.debug('fetchTrustIndexes', { stale, lastFetch, data })
      }
      if (data == null || refetch) {
        // make sure server is up
        await API.ping()

        // fetch trust data
        const { data } = await API.getTrust()

        AsyncStorage.setItem('GD_trust', { data, lastFetch: Date.now() })
        this.trust = data
      } else {
        this.trust = data
      }
    } catch (exception) {
      const { message } = exception

      // if fetch trust request failed even we're pinged the server - it's an exception
      logger.error('Could not fetch /trust', message, exception)
    }
  }

  // checkAvatar was removed as we don't need to keep updates/migrations only funcitons in the common API

  async setAvatar(avatar, withCleanup = false) {
    // save space and load on gun
    const resizedAvatar = await resizeImageRecord(avatar, AVATAR_SIZE)
    const smallAvatar = await resizeImageRecord(resizedAvatar, SMALL_AVATAR_SIZE)
    const cid = await avatarStorage.storeAvatars(resizedAvatar, smallAvatar)

    // eslint-disable-next-line
    return this._linkAvatarsToDatabase(cid, withCleanup)
  }

  // eslint-disable-next-line require-await
  async removeAvatar(withCleanup = false) {
    return this._linkAvatarsToDatabase(null, withCleanup)
  }

  // eslint-disable-next-line require-await
  async loadAvatars(profile: UserModel) {
    const { avatar } = profile

    if (isValidCID(avatar)) {
      const avatars = await avatarStorage.loadAvatars(avatar)

      if (isFunction(profile.setAvatars)) {
        profile.setAvatars(avatars)
      } else {
        assign(profile, avatars)
      }
    }

    return profile
  }

  /**
   * @private
   */
  async _linkAvatarsToDatabase(cid, withCleanup = false) {
    // get current CID value
    let currentCID

    if (withCleanup) {
      currentCID = await this.getProfileFieldValue('avatar')
    }

    // executing GUN update actions first
    const gunAck = await this.setProfileField('avatar', cid, 'public')

    // if avatar was a CID - delete if after GUN updated
    if (withCleanup && isValidCID(currentCID)) {
      await avatarStorage.deleteAvatars(currentCID)
    }

    return gunAck
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
      .replace(/=+$/, '')

    return magicLink
  }

  /**
   * return magic line
   */
  getMagicLink() {
    return this.magiclink
  }

  sign(msg: any) {
    return SEA.sign(msg, this.gunuser.pair())
  }

  /**
   * Returns a Promise that, when resolved, will have all the feeds available for the current user
   * @returns {Promise<Array<FeedEvent>>}
   */
  // eslint-disable-next-line require-await
  async getAllFeed() {
    await this.feedStorage.ready
    return this.feedStorage.getAllFeed()
  }

  /**
   * Subscribes to changes on the event index of day to number of events
   * the "false" (see gundb docs) passed is so we get the complete 'index' on every change and not just the day that changed
   */
  async initFeed() {
    this.feedStorage = new FeedStorage(this.feedDB, this.gun, this.wallet, this)
    await this.feedStorage.init()
    this.startSystemFeed().catch(e => logger.error('initfeed failed initializing startSystemFeed', e.message, e))
  }

  async startSystemFeed() {
    const userProperties = await this.userProperties.getAll()
    const firstVisitAppDate = userProperties.firstVisitApp
    logger.debug('startSystemFeed', { userProperties, firstVisitAppDate })
    this.addBackupCard()
    this.addStartClaimingCard()

    if (Config.enableInvites) {
      const firstInviteCard = await this.feedStorage.hasFeedItem('0.1')
      const secondInviteCard = await this.feedStorage.hasFeedItem(INVITE_REMINDER_ID)
      if (!firstInviteCard) {
        inviteFriendsMessage.id = INVITE_NEW_ID
        const bounty = await this.wallet.getUserInviteBounty()
        inviteFriendsMessage.data.readMore = inviteFriendsMessage.data.readMore
          .replace('100', bounty)
          .replace('50', bounty / 2)
        setTimeout(() => this.enqueueTX(inviteFriendsMessage), 60000) // 2 minutes
      } else if (
        !secondInviteCard &&
        moment(firstInviteCard.date)
          .add(2, 'weeks')
          .isBefore(moment())
      ) {
        inviteFriendsMessage.id = INVITE_REMINDER_ID
        this.enqueueTX(inviteFriendsMessage)
      }
    }

    // first time user visit
    if (firstVisitAppDate == null) {
      this.enqueueTX(Config.isEToro ? welcomeMessageOnlyEtoro : welcomeMessage)
      await this.userProperties.set('firstVisitApp', Date.now())
    }

    logger.debug('startSystemFeed: done')
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
    ;[welcomeMessage, inviteFriendsMessage, startClaiming, longUseOfClaims].forEach(m => {
      const copy = Object.assign({}, m, { id: String(Math.random()) })
      this.feedStorage.enqueueTX(copy)
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
      .decrypt(value => this.unserialize(field, value))
      .catch(reason => {
        let exception = reason
        let { message } = exception

        if (!isError(reason)) {
          message = reason
          exception = new Error(reason)
        }

        logger.error('getProfileFieldValue decrypt failed:', message, exception, { field, profile: this.user.pub })
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
        [currKey]: get(profile, `${currKey}.display`),
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
    const currentPrivacy = await this.profile
      .get(field)
      .get('privacy')
      .then()

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
      logger.warn(
        'setProfile failed',
        'Fields validation failed',
        new Error('setProfile failed: Fields validation failed'),
        { errors, category: ExceptionCategory.Human },
      )

      throw errors
    }

    /**
     * Checking fields to save which changed, even if have undefined value (for example empty mobile input field return undefined).
     */
    const fieldsToSave = keys(this.profileSettings).filter(key => key in profile)

    /**
     * Forming a new object of profile fields those have changed with default value if fields have undefined.
     */
    const profileWithDefaults = defaults(
      Object.assign({}, ...fieldsToSave.map(field => ({ [field]: profile[field] }))),

      /**
       * Picked only those fields that have changed for setting default value if new field value equal undefined.
       */
      pick(this.profileDefaults, fieldsToSave),
    )

    const results = await Promise.all(
      fieldsToSave.map(async field => {
        let isPrivate
        const isAvatar = 'avatar' === field
        const value = profileWithDefaults[field]

        try {
          // we dont store avatar/smallAvatar like other fields, so we return
          if (isAvatar) {
            return this.setAvatar(value)
          }

          if (field.includes('avatar')) {
            return
          }

          isPrivate = get(this.profileSettings, `[${field}].defaultPrivacy`, 'private')

          if (update) {
            isPrivate = await this.getFieldPrivacy(field)
          }

          return await this.setProfileField(field, value, isPrivate)
        } catch (e) {
          logger.warn('setProfile field failed:', e.message, e, {
            field,
            value: isAvatar && value ? '<image record>' : value,
            isPrivate,
          })

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
  static isValidValue(field: string, value: string, trusted: boolean = false) {
    const cleanValue = UserStorage.cleanHashedFieldForIndex(field, value)

    if (!cleanValue) {
      logger.warn(
        `indexProfileField - field ${field} value is empty (value: ${value})`,
        cleanValue,
        new Error('isValidValue failed'),
        { category: ExceptionCategory.Human },
      )
      return false
    }

    return true
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
  // eslint-disable-next-line require-await
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

    logger.debug('setProfileField', { field, value, privacy, onlyPrivacy, display })

    // changed to .all as .race looses possible rejection of promise haven't 'won' the race
    return Promise.all([
      this.profile
        .get(field)
        .get('value')
        .secretAck(this.serialize(field, value))
        .catch(e => {
          logger.warn('encrypting profile field failed', e.message, e, { field })
          throw e
        }),

      storePrivacy(),
    ]).then(last)
  }

  /**
   * Generates index by field if privacy is public, or empty index if it's not public
   * @deprecated no longer indexing in world writable index
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @returns Gun result promise after index is generated
   * @todo This is world writable so theoretically a malicious user could delete the indexes
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
  // eslint-disable-next-line require-await
  async getFeedPage(numResults: number, reset?: boolean = false): Promise<Array<FeedEvent>> {
    return this.feedStorage.getFeedPage(numResults, reset)
  }

  /**
   * Return all feed events*
   * @returns {Promise} Promise with array of standardized feed events
   * @todo Add pagination
   */
  async getFormattedEvents(numResults: number, reset?: boolean): Promise<Array<StandardFeed>> {
    const feed = await this.getFeedPage(numResults, reset)
    logger.debug('getFormattedEvents page result:', {
      numResults,
      reset,
      feedPage: feed,
    })
    const res = feed.map(this.formatEvent)
    logger.debug('getFormattedEvents done formatting events')
    return res
  }

  async getFormatedEventById(id: string): Promise<StandardFeed> {
    const prevFeedEvent = await this.feedStorage.getFeedItemByTransactionHash(id)
    const standardPrevFeedEvent = this.formatEvent(prevFeedEvent)
    if (!prevFeedEvent) {
      return undefined
    }

    if (
      id.startsWith('0x') === false ||
      get(
        prevFeedEvent,
        'data.receiptData',
        get(prevFeedEvent, 'data.receiptEvent', prevFeedEvent && prevFeedEvent.receiptReceived),
      )
    ) {
      return standardPrevFeedEvent
    }

    logger.warn('getFormatedEventById: receipt data missing for:', {
      id,
      standardPrevFeedEvent,
    })

    //if for some reason we don't have the receipt(from blockchain) yet then fetch it
    const receipt = await this.wallet.getReceiptWithLogs(id).catch(e => {
      logger.warn('no receipt found for id:', e.message, e, id)
      return undefined
    })
    if (!receipt) {
      return standardPrevFeedEvent
    }

    //update the event
    let updatedEvent = await this.feedStorage.handleReceipt(receipt)
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
   * @deprecated no longer using world writable index
   * @param {string} username
   */
  async isUsername(username: string) {
    const cleanValue = UserStorage.cleanHashedFieldForIndex('username', username)
    const profile = await this.gun
      .get('users/byusername')
      .get(cleanValue)
      .then()
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

      await this.gun
        .get('survey')
        .get(date)
        .then()
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
      .then()
    return result
  }

  /**
   *
   * @param {string} value email/mobile/walletAddress to fetch by
   */
  async getUserProfilePublickey(value: string) {
    if (!value) {
      return
    }

    const attr = isMobilePhone(value) ? 'mobile' : isEmail(value) ? 'email' : 'walletAddress'
    const hashValue = UserStorage.cleanHashedFieldForIndex(attr, value)

    logger.info(`getUserProfilePublicKey by value <${value}>`, { attr, hashValue })

    let profilePublickey
    if (attr === 'walletAddress') {
      profilePublickey = this.walletAddressIndex[hashValue]
      logger.info(`getUserProfilePublicKey from indexes`, { profilePublickey })
    }
    if (profilePublickey) {
      return profilePublickey
    }

    const { data } = await API.getProfileBy(hashValue)
    profilePublickey = get(data, 'profilePublickey')

    logger.info(`getUserProfilePublicKey from API`, { profilePublickey })

    if (profilePublickey == null) {
      return
    }

    profilePublickey = '~' + data.profilePublickey

    // wallet address has 1-1 connection with profile public key,
    //so we can cache it
    if (attr === 'walletAddress') {
      this.walletAddressIndex[hashValue] = profilePublickey
      AsyncStorage.setItem('GD_walletIndex', this.walletAddressIndex)
    }

    return profilePublickey
  }

  /**
   *
   * @param {string} field - Profile field value (email, mobile or wallet address value)
   * @returns { string } address
   */
  async getUserAddress(field: string) {
    const profile = await this.getUserProfilePublickey(field)
    if (profile == null) {
      return
    }

    return this.gun
      .get(profile)
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
  async getUserProfile(field: string = ''): { name: String, avatar: String } {
    const profile = await this.getUserProfilePublickey(field)
    if (profile == null) {
      logger.info(`getUserProfile by field <${field}> with nullable profile public key`, { profilePublicKey: profile })
      return { name: undefined, avatar: undefined }
    }

    const [avatar = undefined, name = undefined] = await Promise.all([
      this.gun
        .get(profile)
        .get('profile')
        .get('smallAvatar')
        .get('display')
        .then(null, 500),
      this.gun
        .get(profile)
        .get('profile')
        .get('fullName')
        .get('display')
        .then(null, 500),
    ])
    logger.info(`getUserProfile by field <${field}>`, { avatar, name, profilePublicKey: profile })
    if (!name) {
      logger.info(`cannot get fullName from gun by field <${field}>`, { name })
    }
    return { name, avatar }
  }

  /**
   * Returns the feed in a standard format to be loaded in feed list and modal
   *
   * @param {FeedEvent} event - Feed event with data, type, date and id props
   * @returns {Promise} Promise with StandardFeed object,
   *  with props { id, date, type, data: { amount, message, endpoint: { address, displayName, avatar, withdrawStatus }}}
   */
  formatEvent = memoize(
    // eslint-disable-next-line require-await
    (event: FeedEvent) => {
      logger.debug('formatEvent: incoming event', event.id, { event })

      try {
        const { data, type, date, id, status, createdDate, animationExecuted, action } = event
        const { sender, preReasonText, reason, code: withdrawCode, subtitle, readMore, smallReadMore } = data

        const { address, initiator, initiatorType, value, displayName, message, avatar } = this._extractData(event)

        // displayType is used by FeedItem and ModalItem to decide on colors/icons etc of tx feed card
        const displayType = this._extractDisplayType(event)
        logger.debug('formatEvent: initiator data', event.id, {
          initiatorType,
          initiator,
          address,
        })

        let updatedEvent = {
          id,
          date: new Date(date).getTime(),
          type,
          displayType,
          status,
          createdDate,
          animationExecuted,
          action,
          data: {
            receiptHash: get(event, 'data.receiptEvent.txHash'),
            endpoint: {
              address: sender,
              displayName,
              avatar,
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

        logger.debug('formatEvent: updateEvent', { updatedEvent })
        return updatedEvent
      } catch (e) {
        logger.error('formatEvent: failed formatting event:', e.message, e, {
          event,
        })
        return {}
      }
    },
  )

  _extractData({
    type,
    id,
    status,
    data: { receiptEvent, from = '', to = '', customName = '', counterPartyFullName, counterPartySmallAvatar, amount },
  }) {
    const { isAddress } = this.wallet.wallet.utils
    const data = {
      address: '',
      initiator: '',
      initiatorType: '',
      value: '',
      displayName: '',
      message: '',
    }

    if (type === FeedItemType.EVENT_TYPE_SEND || type === FeedItemType.EVENT_TYPE_SENDDIRECT) {
      data.address = isAddress(to) ? to : receiptEvent && receiptEvent.to
      data.initiator = to
    } else if (type === FeedItemType.EVENT_TYPE_CLAIM) {
      data.message = 'Your daily basic income'
    } else {
      data.address = isAddress(from) ? from : receiptEvent && receiptEvent.from
      data.initiator = from
    }

    data.initiatorType = isMobilePhone(data.initiator) ? 'mobile' : isEmail(data.initiator) ? 'email' : undefined

    data.value = get(receiptEvent, 'value') || get(receiptEvent, 'amount') || amount

    const fromGD =
      (type === FeedItemType.EVENT_TYPE_BONUS ||
        type === FeedItemType.EVENT_TYPE_CLAIM ||
        data.address === NULL_ADDRESS ||
        id.startsWith('0x') === false) &&
      'GoodDollar'
    const fromEmailMobile = data.initiatorType && data.initiator
    data.displayName = customName || counterPartyFullName || fromEmailMobile || fromGD || 'Unknown'

    data.avatar = status === 'error' || fromGD ? -1 : counterPartySmallAvatar

    logger.debug('formatEvent: parsed data', {
      id,
      type,
      to,
      customName,
      counterPartyFullName,
      from,
      receiptEvent,
      data,
    })

    return data
  }

  _extractWithdrawStatus(withdrawCode, otplStatus = 'pending', status, type) {
    if (type === 'withdraw') {
      return ''
    }
    return status === 'error' ? status : withdrawCode ? otplStatus : ''
  }

  //displayType is used by FeedItem and ModalItem to decide on colors/icons etc of tx feed card
  _extractDisplayType(event) {
    switch (event.type) {
      case FeedItemType.EVENT_TYPE_BONUS:
      case FeedItemType.EVENT_TYPE_SEND:
      case FeedItemType.EVENT_TYPE_SENDDIRECT: {
        const type = FeedItemType.EVENT_TYPE_SENDDIRECT === event.type ? FeedItemType.EVENT_TYPE_SEND : event.type
        if (event.otplStatus) {
          return type + event.otplStatus
        }
        return type + (event.status || TxStatus.COMPLETED).toLowerCase()
      }
      default:
        return event.type
    }
  }

  async _getProfileNodeTrusted(initiatorType, initiator, address): Gun {
    if (!initiator && (!address || address === NULL_ADDRESS)) {
      return
    }

    const byIndex = initiatorType && initiator && (await this.getUserProfilePublickey(initiator))

    const byAddress = address && (await this.getUserProfilePublickey(address))

    let gunProfile = (byIndex || byAddress) && this.gun.get(byIndex || byAddress).get('profile')

    //need to return object so promise.all doesn't resolve node
    return {
      gunProfile,
    }
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

      // need to return object so promise.all doesn't resolve node
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

  /**
   * enqueue a new pending TX done on DAPP, to be later merged with the blockchain tx
   * the DAPP event can contain more details than the blockchain tx event
   * @param {FeedEvent} event
   * @returns {Promise<>}
   */
  // eslint-disable-next-line require-await
  async enqueueTX(_event: FeedEvent): Promise<> {
    return this.feedStorage.enqueueTX(_event)
  }

  /**
   * Sets the event's status
   * @param {string} eventId
   * @param {string} status
   * @returns {Promise<FeedEvent>}
   */
  // eslint-disable-next-line require-await
  async updateEventStatus(eventId: string, status: string): Promise<FeedEvent> {
    return this.feedStorage.updateEventStatus(eventId, status)
  }

  /**
   * Sets the feed animation status
   * @param {string} eventId
   * @param {boolean} status
   * @returns {Promise<FeedEvent>}
   */
  // eslint-disable-next-line require-await
  async updateFeedAnimationStatus(eventId: string, status = true): Promise<FeedEvent> {
    return this.feedStorage.updateFeedAnimationStatus(eventId, status)
  }

  /**
   * Sets the event's status
   * @param {string} eventId
   * @param {string} status
   * @returns {Promise<FeedEvent>}
   */
  // eslint-disable-next-line require-await
  async updateOTPLEventStatus(eventId: string, status: string): Promise<FeedEvent> {
    return this.feedStorage.updateOTPLEventStatus(eventId, status)
  }

  /**
   * Sets the event's status as error
   * @param {string} txHash
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line require-await
  async markWithErrorEvent(txHash: string): Promise<void> {
    return this.feedStorage.markWithErrorEvent(txHash)
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

  async getProfile(): Promise<any> {
    const encryptedProfile = await this.loadGunField(this.profile)

    if (encryptedProfile === undefined) {
      logger.error('getProfile: profile node undefined', '', new Error('Profile node undefined'))

      return {}
    }

    return this.getPrivateProfile(encryptedProfile)
  }

  loadGunField(gunNode): Promise<any> {
    // eslint-disable-next-line no-async-promise-executor
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
   * deleting profile actually doesn't delete but encrypts everything
   */
  async deleteProfile(): Promise<boolean> {
    this.unSubscribeProfileUpdates()

    // first delete from indexes then delete the profile itself
    const { profile, _getProfileFields } = this
    let profileFields = await profile.then(_getProfileFields)

    const deleteField = field => {
      if (!field.includes('avatar')) {
        return this.setProfileFieldPrivacy(field, 'private')
      }

      if (field === 'avatar') {
        return this.removeAvatar()
      }
    }

    await Promise.all(
      profileFields.map(field =>
        retry(() => deleteField(field), 1).catch(exception => {
          let error = exception
          let { message } = error || {}

          if (!error) {
            error = new Error(`Deleting profile field ${field} failed`)
            message =
              'Some error occurred during' +
              (field === 'avatar' ? 'deleting avatar' : 'setting the privacy to the field')
          }

          logger.error(`Deleting profile field ${field} failed`, message, error, { index: field })
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
