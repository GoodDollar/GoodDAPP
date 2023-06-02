//@flow

import { assign, flatten, get, invokeMap, isEqual, keys, memoize, pick, uniq } from 'lodash'
import { isAddress } from 'web3-utils'
import moment from 'moment'

import { t } from '@lingui/macro'
import isEmail from '../../lib/validators/isEmail'

import { retry } from '../utils/async'

import FaceVerificationAPI from '../../components/faceVerification/api/FaceVerificationApi'
import Config from '../../config/config'
import API from '../API'
import pino from '../logger/js-logger'
import isMobilePhone from '../validators/isMobilePhone'

import { AVATAR_SIZE, resizeImage, SMALL_AVATAR_SIZE } from '../utils/image'
import { isValidDataUrl } from '../utils/base64'
import mustache from '../utils/mustache'
import { ThreadDB } from '../textile/ThreadDB'
import uuid from '../utils/uuid'
import type { DB } from '../realmdb/RealmDB'
import { type StandardFeed } from './StandardFeed'
import { type UserModel } from './UserModel'
import UserProperties from './UserProperties'
import { UserProfileStorage } from './UserProfileStorage'
import { FeedEvent, FeedItemType, FeedStorage, TxStatus } from './FeedStorage'
import createAssetStorage, { type UserAssetStorage } from './UserAssetStorage'
import { prepareInviteCard } from './utlis'
import type { FeedCategory } from './FeedCategory'
import { FeedCategories } from './FeedCategory'

const logger = pino.child({ from: 'UserStorage' })

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const FV_IDENTIFIER_MSG2 = mustache(`Sign this message to request verifying your account {account} and to create your own secret unique identifier for your anonymized record.
You can use this identifier in the future to delete this anonymized record.
WARNING: do not sign this message unless you trust the website/application requesting this signature.`)

/**
 * possible privacy level for profile fields
 */
export type FieldPrivacy = 'private' | 'public' | 'masked'

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
 * User's profile
 */
export type Profile = { [key: string]: ProfileField }

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
    counterPartyFullName: t`Welcome to GoodDollar!`,
    subtitle: t`Welcome to GoodDollar!`,
    readMore: t`Claim free G$ coins daily.`,
    receiptEvent: {
      from: NULL_ADDRESS,
    },
    reason: t`Right here is where you will claim your basic income in GoodDollar coins every day.

      Together, we will build a better financial future for all of us!`,
  },
}

export const inviteFriendsMessage = {
  id: '0',
  type: 'invite',
  status: 'completed',
  data: {
    counterPartyFullName: t`Invite friends and earn G$'s`,
    subtitle: t`Invite your friends now`,
    readMore: `Get {inviterAmount}G$ for each friend who signs up\nand they get {inviteeAmount}G$!`,
    receiptEvent: {
      from: NULL_ADDRESS,
    },
    reason: t`Help expand the network by inviting family, friends, and colleagues to participate and claim their daily income.
    The more people join, the more effective GoodDollar will be, for everyone.`,
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
    counterPartyFullName: t`Backup your wallet. Now.`,
    subtitle: t`You need to backup your`,
    readMore: t`wallet pass phrase.`,
    receiptEvent: {
      from: NULL_ADDRESS,
    },
    reason: t`Your pass phrase is the only key to your wallet, this is why our wallet is super secure. Only you have access to your wallet and money. But if you won’t backup your pass phrase or if you lose it — you won’t be able to access your wallet and all your money will be lost forever.`,
  },
}

export const startClaiming = {
  id: '4',
  type: 'claiming',
  status: 'completed',
  data: {
    counterPartyFullName: t`Claim your G$'s today!`, //title in modal
    subtitle: t`Claim your G$'s today!`, //title in feed list
    readMore: false,
    receiptEvent: {
      from: NULL_ADDRESS,
    },

    reason: t`GoodDollar gives every active member a small daily income.

      Every day, sign in and claim free GoodDollars and use them to pay for goods and services.`,
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
   * a gun node referring tto gun.user().get('properties')
   * @instance {UserProperties}
   */
  userProperties: UserProperties

  /**
   * current feed item
   */
  cursor: number = 0

  /**
   * A promise which is resolved once init() is done
   */
  ready: Promise<boolean>

  database: DB

  db: ThreadDB

  userProperties

  userAssets: UserAssetStorage

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

  // trusted GoodDollar signature
  trust = {}

  walletAddressIndex = {}

  /**
   * A promise which is resolved once init() is done
   */
  ready: Promise<boolean> = null

  registeredReady: Promise<boolean> = null

  constructor(wallet: GoodWallet, database: DB, userProperties, wallets: { fuse: GoodWallet, celo: GoodWallet }) {
    this.wallet = wallet
    this.wallets = wallets
    this.database = database
    this.userProperties = userProperties
    this._formatEvent.cache = new WeakMap()
    this.init()
  }

  /**
   * Initialize wallet, user, feed and subscribe to events
   */
  async initRegistered() {
    const { initializedRegistered, userProperties, profileStorage } = this

    logger.debug('Initializing UserStorage for registered user', initializedRegistered)

    if (initializedRegistered) {
      return
    }

    await this.initDatabases()

    // after we initialize the database wait for user properties which depands on database
    await Promise.all([userProperties.ready, profileStorage.init(), this.initFeed()])

    const { feedStorage, setRegistered } = this

    logger.debug('done initializing registered userstorage')
    feedStorage.ready.then(() => setRegistered(true))

    this.initializedRegistered = true
    return true
  }

  async initDatabases() {
    const db = new ThreadDB(this.profilePrivateKey)
    const userAssets = createAssetStorage(db)

    await db.init()
    await this.database.init(db) // only once user is registered he has access to realmdb via signed jwt

    assign(this, { db, userAssets })
  }

  init(): Promise {
    const { wallet } = this
    const registeredReady = new Promise(resolve => (this.setRegistered = resolve))

    const ready = (async () => {
      try {
        // firstly, awaiting for wallet is ready
        await wallet.ready

        this.profilePrivateKey = wallet.getEd25519Key('gundb')
        this.profileStorage = new UserProfileStorage(this.wallet, this.database, this.profilePrivateKey)

        logger.debug('userStorage initialized.')
        return true
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

    assign(this, { ready, registeredReady })
    return ready
  }

  /**
   * Avatar setter
   * @returns {Promise<CID[]>}
   */
  // eslint-disable-next-line require-await
  async setAvatar(avatar): Promise<CID[]> {
    return this._clearAvatarsCache(async () => {
      const cids = await this._resizeAndStoreAvatars(avatar)

      return this.profileStorage.setProfile(cids, true)
    })
  }

  // eslint-disable-next-line require-await
  async getAvatar() {
    const cid = this.getProfileFieldDisplayValue('avatar')

    return this.loadAvatar(cid)
  }

  // eslint-disable-next-line require-await
  async getSmallAvatar() {
    const cid = this.getProfileFieldDisplayValue('smallAvatar')

    return this.loadAvatar(cid)
  }

  // eslint-disable-next-line require-await
  async loadAvatar(cid: stirng) {
    return this.userAssets.load(cid)
  }

  /**
   * remove Avatar from profile
   * @returns {Promise<[Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>, Promise<void>]>}
   */
  // eslint-disable-next-line require-await
  async removeAvatar(): Promise<void> {
    // eslint-disable-next-line require-await
    return this._clearAvatarsCache(async () =>
      this.profileStorage.setProfileFields({ avatar: null, smallAvatar: null }),
    )
  }

  /**
   * store Avatar
   * @param avatarDataUrl
   * @returns {Promise<{ avatar: CID, smallAvatar: CID }>}
   */
  async _resizeAndStoreAvatars(avatarDataUrl: string): Promise<{ avatar: string, smallAvatar: string }> {
    let resizedDataUrl
    const avatarSizes = [AVATAR_SIZE, SMALL_AVATAR_SIZE]

    const resizedAvatars = await Promise.all(
      avatarSizes.map(async size => {
        resizedDataUrl = await resizeImage(resizedDataUrl || avatarDataUrl, size)

        return resizedDataUrl
      }),
    )

    const [avatar, smallAvatar] = await Promise.all(
      // eslint-disable-next-line require-await
      resizedAvatars.map(async dataUrl => this.userAssets.store(dataUrl)),
    )

    return { avatar, smallAvatar }
  }

  async _clearAvatarsCache(callback) {
    const avatarsCIDs = ['avatar', 'smallAvatar'].map(field => this.getProfileFieldDisplayValue(field))

    await callback()
    await Promise.all(
      // eslint-disable-next-line require-await
      avatarsCIDs.map(async cid => {
        if (!cid) {
          return
        }

        this.userAssets.clearCache(cid)
      }),
    )
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
    msg = new TextEncoder().encode(msg)
    return this.profilePrivateKey.sign(msg).then(_ => Buffer.from(_).toString('base64'))
  }

  /**
   * Returns a Promise that, when resolved, will have all the feeds available for the current user
   * @returns {Promise<Array<FeedEvent>>}
   */
  // eslint-disable-next-line require-await
  async getAllFeed() {
    return this.feedStorage.getAllFeed()
  }

  /**
   * initializes the feedstorage and default feed items
   */
  async initFeed() {
    this.feedStorage = new FeedStorage(this)

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
      const firstInviteCard = await this.feedStorage.hasFeedItem(INVITE_NEW_ID)
      const secondInviteCard = await this.feedStorage.hasFeedItem(INVITE_REMINDER_ID)

      const shouldAddSecondCard =
        firstInviteCard &&
        !secondInviteCard &&
        moment(firstInviteCard.date)
          .add(2, 'weeks')
          .isBefore(moment())

      if (!firstInviteCard || shouldAddSecondCard) {
        const inviteCard = await prepareInviteCard(
          shouldAddSecondCard ? INVITE_REMINDER_ID : INVITE_NEW_ID,
          inviteFriendsMessage,
          this.wallet,
        )

        // 2nd immediately, first one in 2 minutes
        setTimeout(() => this.enqueueTX(inviteCard), shouldAddSecondCard ? 0 : 60000)
      }
    }

    // first time user visit
    if (firstVisitAppDate == null) {
      this.enqueueTX(welcomeMessage)
      await this.userProperties.set('firstVisitApp', Date.now())
    }

    logger.debug('startSystemFeed: done')
  }

  async addAllCardsTest() {
    const inviteCard = await prepareInviteCard(uuid(), inviteFriendsMessage, this.wallet)

    ;[welcomeMessage, inviteCard, startClaiming].forEach(m => {
      this.feedStorage.enqueueTX({ ...m, id: String(Math.random()) })
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
  getProfileFieldValue(field: string): string {
    return this.profileStorage.getProfileFieldValue(field)
  }

  getProfileFieldDisplayValue(field: string): string {
    return this.profileStorage.getProfileFieldDisplayValue(field)
  }

  /**
   * Return display attribute of each profile property
   *
   * @returns {UserModel} - User model with display values
   */
  getDisplayProfile(): UserModel {
    return this.profileStorage.getDisplayProfile()
  }

  /**
   * Returns user model with attribute values
   *
   * @param {object} profile - user profile
   * @returns {object} UserModel with some inherit functions
   */
  getPrivateProfile(profile: any): UserModel {
    return this.profileStorage.getPrivateProfile()
  }

  getFieldPrivacy(field) {
    return this.profileStorage.getFieldPrivacy(field)
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
  // eslint-disable-next-line require-await
  async setProfile(profile: UserModel, update: boolean = false): Promise<void> {
    const { avatar } = profile

    if (!!avatar && isValidDataUrl(avatar)) {
      const currentAvatar = await this.getAvatar() // will be already cached

      if (avatar !== currentAvatar) {
        // if new avatar was set - re-uploading
        const cids = await this._resizeAndStoreAvatars(avatar)

        assign(profile, cids)
      }
    }

    return this.profileStorage.setProfile(profile, update)
  }

  /**
   * Set profile field with privacy settings
   *
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @param onlyPrivacy
   * @returns {Promise} Promise with updated field value, secret, display and privacy.
   */
  // eslint-disable-next-line require-await
  async setProfileField(
    field: string,
    value: string,
    privacy: FieldPrivacy = 'public',
    onlyPrivacy: boolean = false,
  ): Promise<void> {
    return this.profileStorage.setProfileField(field, value, privacy, onlyPrivacy)
  }

  /**
   * Set profile field privacy.
   *
   * @param {string} field - Profile attribute
   * @param {string} privacy - (private | public | masked)
   * @returns {Promise} Promise with updated field value, secret, display and privacy.
   */
  // eslint-disable-next-line require-await
  async setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<void> {
    return this.profileStorage.setProfileFieldPrivacy(field, privacy)
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
  async getFeedPage(
    numResults: number,
    reset?: boolean,
    category: FeedCategory = FeedCategories.All,
  ): Promise<Array<FeedEvent>> {
    return this.feedStorage.getFeedPage(numResults, reset, category)
  }

  /**
   * Return all feed events*
   * @returns {Promise} Promise with array of standardized feed events
   * @todo Add pagination
   */
  async getFormattedEvents(
    numResults: number,
    reset?: boolean,
    category: FeedCategory = FeedCategories.All,
  ): Promise<Array<StandardFeed>> {
    const feed = await this.getFeedPage(numResults, reset, category)

    logger.debug('getFormattedEvents page result:', {
      numResults,
      reset,
      feedPage: feed,
    })

    // eslint-disable-next-line require-await
    const res = await Promise.all(feed.map(async event => this.formatEvent(event)))

    logger.debug('getFormattedEvents done formatting events')
    return res
  }

  async getFormatedEventById(id: string): Promise<StandardFeed> {
    const prevFeedEvent = await this.feedStorage.getFeedItemByTransactionHash(id)
    const standardPrevFeedEvent = await this.formatEvent(prevFeedEvent)

    if (!prevFeedEvent) {
      return undefined
    }

    const receiptReceived = get(prevFeedEvent, 'data.receiptEvent', get(prevFeedEvent, 'receiptReceived'))

    if (
      id.startsWith('0x') === false ||
      get(prevFeedEvent, 'data.receiptData', receiptReceived) ||
      prevFeedEvent.type === 'news'
    ) {
      return standardPrevFeedEvent
    }

    logger.warn('getFormatedEventById: receipt data missing for:', {
      id,
      standardPrevFeedEvent,
    })

    // if for some reason we don't have the receipt(from blockchain) yet then fetch it
    const receipt = await this.wallet.getReceiptWithLogs(id).catch(e => {
      logger.warn('no receipt found for id:', e.message, e, id)
      return undefined
    })

    if (!receipt) {
      return standardPrevFeedEvent
    }

    // update the event
    let updatedEvent = await this.feedStorage.handleReceipt(receipt)

    if (updatedEvent === undefined) {
      return standardPrevFeedEvent
    }

    logger.debug('getFormatedEventById updated event with receipt', {
      prevFeedEvent,
      updatedEvent,
    })

    return this.formatEvent(updatedEvent)
  }

  /**
   * Checks if username connected to a profile
   * @deprecated no longer using world writable index
   * @param {string} username
   */
  async isUsername(username: string) {
    const profiles = await this.profileStorage.getProfilesByHashIndex('username', username)
    return profiles?.length > 0
  }

  /**
   *
   * @param {string} value email/mobile/walletAddress to fetch by
   */
  async getUserProfilePublickey(value: string) {
    const { publicKey } = (await this.profileStorage.getProfileByWalletAddress(value)) || {}
    logger.info(`getUserProfilePublicKey`, { publicKey })

    if (publicKey == null) {
      return
    }

    return publicKey
  }

  /**
   *
   * @returns { string } address
   * @param value
   */
  async getUserAddress(value: string) {
    if (!value) {
      return
    }

    const attr = isMobilePhone(value) ? 'mobile' : isEmail(value) ? 'email' : 'walletAddress'

    const profile = await this.profileStorage.getProfilesByHashIndex(attr, value)
    if (profile.length === 0) {
      return
    }

    return profile[0].walletAddress.display
  }

  /**
   * Returns the feed in a standard format to be loaded in feed list and modal
   *
   * @param {FeedEvent} event - Feed event with data, type, date and id props
   * @returns {Promise} Promise with StandardFeed object,
   *  with props { id, date, type, data: { amount, message, endpoint: { address, displayName, avatar, withdrawStatus }}}
   */
  // eslint-disable-next-line require-await
  async formatEvent(event: FeedEvent) {
    try {
      return await this._formatEvent(event)
    } catch (e) {
      logger.error('formatEvent: failed formatting event:', e.message, e, { event })

      // do not cache if error
      this._formatEvent.cache.delete(event)
      return {}
    }
  }

  async sync() {
    const { database, userProperties } = this

    await Promise.all(invokeMap([database, userProperties], '_syncFromRemote')).catch(e =>
      logger.warn('_syncFromRemote failed:', e.message, e),
    )
  }

  _formatEvent = memoize(async event => {
    logger.debug('formatEvent: incoming event', event.id, { event })

    const { feedStorage } = this
    const { data, type } = event
    const { counterPartyFullName, counterPartySmallAvatar } = data

    const counterPartyEvents = [
      FeedItemType.EVENT_TYPE_SENDDIRECT,
      FeedItemType.EVENT_TYPE_SEND,
      FeedItemType.EVENT_TYPE_WITHDRAW,
      FeedItemType.EVENT_TYPE_RECEIVE,
      FeedItemType.EVENT_TYPE_SENDBRIDGE,
    ]

    if (counterPartyEvents.includes(type) && (!counterPartyFullName || !counterPartySmallAvatar)) {
      const counterPartyData = await feedStorage.getCounterParty(event)

      if (!isEqual(counterPartyData, pick(data, keys(counterPartyData)))) {
        assign(data, counterPartyData)
        feedStorage.updateFeedEvent(event)
      }
    }

    const { date, id, status, createdDate, animationExecuted, action, chainId } = event
    const {
      sender,
      preReasonText,
      reason,
      code: withdrawCode,
      subtitle,
      readMore,
      smallReadMore,
      senderEmail,
      senderName,
      invoiceId,
      sellerWebsite,
      sellerName,
      picture,
      link,
      sponsoredLink,
      sponsoredLogo,
    } = data
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
      chainId,
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
        senderEmail,
        senderName,
        invoiceId,
        sellerWebsite,
        sellerName,
        preMessageText: preReasonText,
        message: reason || message,
        subtitle,
        readMore,
        smallReadMore,
        withdrawCode,
        picture,
        link,
        sponsoredLink,
        sponsoredLogo,
      },
    }

    logger.debug('formatEvent: updateEvent', { updatedEvent })
    return updatedEvent
  })

  _extractData({
    type,
    id,
    status,
    data: { receiptEvent, from = '', to = '', customName = '', counterPartyFullName, counterPartySmallAvatar, amount },
  }) {
    const data = {
      address: '',
      initiator: '',
      initiatorType: '',
      value: '',
      displayName: '',
      message: '',
    }

    if (
      type === FeedItemType.EVENT_TYPE_SEND ||
      type === FeedItemType.EVENT_TYPE_SENDDIRECT ||
      type === FeedItemType.EVENT_TYPE_SENDBRIDGE
    ) {
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

    const {
      wallet,
      wallets: { fuse, celo },
    } = this

    const ubiAddresses = uniq(flatten([wallet, fuse, celo].map(w => w.getUBIAddresses())))
    const addressLc = (data.address || '').toLowerCase()
    const fromGDUbi = ubiAddresses.some(addr => addr === addressLc) && 'GoodDollar UBI'

    const fromGD =
      (type === FeedItemType.EVENT_TYPE_BONUS ||
        type === FeedItemType.EVENT_TYPE_CLAIM ||
        data.address === NULL_ADDRESS ||
        fromGDUbi ||
        id.startsWith('0x') === false) &&
      'GoodDollar'

    const fromEmailMobile = data.initiatorType && data.initiator

    data.displayName = customName || counterPartyFullName || fromEmailMobile || fromGDUbi || fromGD || 'Unknown'
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

  // displayType is used by FeedItem and ModalItem to decide on colors/icons etc of tx feed card
  _extractDisplayType(event) {
    switch (event.type) {
      case FeedItemType.EVENT_TYPE_BONUS:
      case FeedItemType.EVENT_TYPE_SEND:
      case FeedItemType.EVENT_TYPE_SENDDIRECT:
      case FeedItemType.EVENT_TYPE_SENDBRIDGE: {
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

  /**
   * enqueue a new pending TX done on DAPP, to be later merged with the blockchain tx
   * the DAPP event can contain more details than the blockchain tx event
   * @param {FeedEvent} _event
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

  getProfile(): Profile {
    return this.profileStorage.getProfile()
  }

  // eslint-disable-next-line require-await
  async getPublicProfile(key: string, string?: string): Promise<any> {
    return this.profileStorage.getPublicProfile(key, string)
  }

  async getFaceIdentifiers(): string {
    const v2Identifier = await this.wallet.sign(FV_IDENTIFIER_MSG2({ account: this.wallet.account }), 'gd')
    const v1Identifier = this.wallet.getAccountForType('faceVerification').slice(2)

    return { v1Identifier, v2Identifier }
  }

  /**
   * delete user profile
   */
  // eslint-disable-next-line require-await
  async deleteProfile(): Promise<boolean> {
    return this.profileStorage.deleteProfile()
  }

  /**
   * Delete the user account.
   * Deleting profile and clearing local storage
   * Calling the server to delete their data
   */
  async deleteAccount(): Promise<boolean> {
    let deleteResults = false
    let deleteAccountResult
    const { wallet, userProperties, _trackStatus } = this

    try {
      const { v1Identifier, v2Identifier } = await this.getFaceIdentifiers()

      // pass also older v1 identifier (ie faceVerification tagged public address)
      await FaceVerificationAPI.disposeFaceSnapshot(v2Identifier, v1Identifier)
      deleteAccountResult = await API.deleteAccount()

      if (get(deleteAccountResult, 'data.ok', false)) {
        deleteResults = await Promise.all([
          _trackStatus(retry(() => wallet.deleteAccount(), 1, 500), 'wallet'),
          _trackStatus(this.database.deleteAccount()),
          _trackStatus(this.deleteProfile(), 'profile'),
          _trackStatus(userProperties.reset(), 'userprops'),
        ])
      }
    } catch (e) {
      logger.error('deleteAccount unexpected error', e.message, e)
      return false
    }

    logger.debug('deleteAccount', deleteResults)
    return true
  }

  _trackStatus = (promise, label) =>
    promise
      .then(() => {
        const status = { [label]: 'ok' }

        logger.debug('Cleanup:', status)
        return status
      })
      .catch(error => {
        const status = { [label]: 'failed' }
        const e = error

        logger.debug('Cleanup:', e.message, e, status)
        return status
      })
}
