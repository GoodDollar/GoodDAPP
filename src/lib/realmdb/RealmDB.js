// @flow
import { first, isPlainObject, once, sortBy } from 'lodash'
import * as Realm from 'realm-web'
import TextileCrypto from '@textile/crypto' // eslint-disable-line import/default
import EventEmitter from 'eventemitter3'
import Mutex from 'await-mutex'
import { JWT } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'

import Config from '../../config/config'
import logger from '../logger/js-logger'

import type { ThreadDB } from '../textile/ThreadDB'
import type { ProfileDB } from '../userStorage/UserProfileStorage'
import type { Profile } from '../userStorage/UserStorageClass'
import type { FeedCategory } from '../userStorage/FeedCategory'
import { FeedCategories } from '../userStorage/FeedCategory'
import type { TransactionDetails } from '../userStorage/FeedStorage'
import { retry } from '../utils/async'
import NewsSource from './feedSource/NewsSource'
import TransactionsSource from './feedSource/TransactionsSource'
import { makeCategoryMatcher } from './feed'

// when 'failed to fetch' increase delay before next try to 5 seconds
const _retryMiddleware = (exception, options, defaultOptions) => {
  const { message } = exception || {}

  // if not failed to fetch - reset interval to the default one
  if (!(message || '').startsWith('Failed to fetch')) {
    return defaultOptions
  }

  // otherwise increase delay interval to 5 seconds
  return {
    ...options,
    interval: 5000,
  }
}

const log = logger.child({ from: 'RealmDB' })
const _retry = fn => retry(fn, 3, 1000, _retryMiddleware)

export interface DB {
  init(db: ThreadDB): void;
  write(feeditem): Promise<void>;
  read(id: string): Promise<any>;
  readByPaymentId(paymentId: string): Promise<any>;
  encryptSettings(settings: object): Promise<any>;
  decryptSettings(): Promise<object>;
  getFeedPage(numResults, offset, category?: FeedCategory): Promise<Array<object>>;
}

class RealmDB implements DB, ProfileDB {
  app: Realm.App

  credentials: Realm.Credentials<Realm.Credentials.JWTPayload>

  user: Realm.User

  db: ThreadDB

  privateKey: TextileCrypto.PrivateKey

  isReady: boolean = false

  dbEvents = new EventEmitter()

  sources = [
    TransactionsSource,
    {
      // poll ceramic feed once per some time interval
      source: NewsSource,
      syncInterval: Config.ceramicPollInterval,
    },
  ]

  constructor() {
    const { _createSyncSources, sources } = this

    this.sources = _createSyncSources(sources)
    this.ready = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * basic initialization
   * @param privateKey
   */
  async init(db: ThreadDB) {
    try {
      const { privateKey, Feed } = db

      this.privateKey = privateKey
      this.db = db

      Feed.table.hook('creating', (id, event) => this._notifyChange({ id, event }))
      Feed.table.hook('updating', (modify, id, event) => this._notifyChange({ modify, id, event }))
      Feed.table.hook('deleting', (id, event) => this._notifyChange({ id, event }))

      await this._initRealmDB()

      this.resolve()
      this.isReady = true
    } catch (e) {
      log.error('failed initializing', e.message, e)
      this.reject(e)
    }
  }

  get _databaseName() {
    switch (Config.env) {
      case 'production':
        return 'wallet_prod'
      case 'staging':
        return 'wallet_qa'
      default:
      case 'development':
        return 'wallet'
    }
  }

  /**
   * helper to initialize with realmdb using JWT token
   * @returns
   */
  async _initRealmDB() {
    let jwt
    const REALM_APP_ID = Config.realmAppID

    log.debug('initRealmDB', { REALM_APP_ID })

    try {
      jwt = await AsyncStorage.getItem(JWT)
      log.debug('initRealmDB', { jwt })

      this.app = new Realm.App({ id: REALM_APP_ID })
      this.credentials = Realm.Credentials.jwt(jwt)

      await this._connectRealmDB()
      this._syncFromRemote()

      return this.user
    } catch (err) {
      log.error('Failed to log in', err.message, err, { jwt, REALM_APP_ID })
      throw err
    }
  }

  async _connectRealmDB() {
    const user = await _retry(() => this.app.logIn(this.credentials))

    // Authenticate the user
    log.debug('realm logged in', { user })
    this.user = user
  }

  async _pingRealmDB() {
    if (!this.isReady) {
      await this.ready
    }

    const { user } = this

    try {
      if (!user || user !== this.app.currentUser || user.state !== 'active') {
        await this._connectRealmDB()
      }
    } catch (e) {
      log.error('_pingRealmDB failed:', e.message, e)
      throw e
    }
  }

  async wrapQuery(callback) {
    await this._pingRealmDB()

    try {
      return await _retry(callback)
    } catch (exception) {
      // try to extract mongodb error code for message grouping in analytics
      let { error = '', message } = exception
      const errorCode = first(error.match(/^E\d+/))

      log.error('query failed after retries:', errorCode || message, exception, { errorCode, message })
      throw exception
    }
  }

  /**
   *
   */
  get database(): Realm.Services.MongoDBDatabase {
    const { app, _databaseName } = this
    const mongodb = app.currentUser.mongoClient('mongodb-atlas')

    // `App.currentUser` updates to match the logged in user
    return mongodb.db(_databaseName)
  }

  /**
   * helper to resolve issue with toJSON error in console
   * @returns {Realm.Services.MongoDB.MongoDBCollection<any>}
   * @private
   */
  get encryptedFeed() {
    return this.database.collection('encrypted_feed')
  }

  /**
   * helper to resolve issue with toJSON error in console
   * @returns {Realm.Services.MongoDB.MongoDBCollection<any>}
   * @private
   */
  get profiles() {
    return this.database.collection('user_profiles')
  }

  get inboxes() {
    return this.database.collection('inboxes')
  }

  _createSyncSources = sources =>
    sources.map(config => {
      let { source, syncInterval } = config

      if (!isPlainObject(config)) {
        source = config
        syncInterval = false
      }

      return {
        mutex: new Mutex(),
        source: source.create(this, log),
        interval: syncInterval * 1000, // convert to ms
      }
    })

  /**
   * sync between devices.
   * used in Appswitch to sync with remote when user comes back to app
   */
  async _syncFromRemote() {
    const { _syncWithSource } = this

    await Promise.all(
      this.sources.map(async ({ source, mutex, interval }) => {
        let release

        if (mutex.isLocked()) {
          log.warn('_syncFromRemote: mutex locked, skipping')
          return
        }

        try {
          release = await mutex.lock()
          log.debug('_syncFromRemote: mutex locked')
        } catch (e) {
          log.warn('_syncFromRemote: failed obtain mutex lock, skipping', e.message, e)
          return
        }

        await _syncWithSource(source, release, interval)
      }),
    )
  }

  /** @private */
  _syncWithSource = async (source, release, syncInterval) => {
    const now = Date.now()
    let failed = false
    let interval = 0

    try {
      await source.syncFromRemote()
    } catch (e) {
      failed = true
      log.warn('_syncFromRemote failed:', e.message, e)
    }

    // release mutex immediately if sync failed or no interval was configured
    if (false !== syncInterval && !failed) {
      // otherwise calculate how much we need to wait to the next polling interval
      interval = Math.max(0, syncInterval - (Date.now() - now))
    }

    log.debug('_syncFromRemote: unlocking mutex after (ms)', { interval })

    // wait for release 'in background', return from fn just after sync call
    setTimeout(() => {
      log.debug('_syncFromRemote: mutex unlocked')
      release()
    }, interval)
  }

  /**
   * helper for testing migration from gundb
   * TODO: remove
   */
  async _syncFromLocalStorage() {
    await this.db.Feed.clear()

    let items = await AsyncStorage.getItem('GD_feed').then(_ => Object.values(_ || {}))

    items.forEach(i => {
      i._id = i.id
      i.date = new Date(i.date).toISOString()
      i.createdDate = new Date(i.createdDate).toISOString()
    })

    items = sortBy(items, 'date')

    if (items.length) {
      await Promise.all(items.map(i => this.write(i)))
    }

    log.debug('initialized threaddb with feed from asyncstorage. count:', items.length, items)
  }

  /**
   * listen to database changes
   * @param {*} callback
   */
  on(callback) {
    this.dbEvents.on('changes', callback)
  }

  /**
   * unsubscribe listener
   * @param {*} callback
   */
  off(callback = null) {
    const { dbEvents } = this

    if (callback) {
      dbEvents.off('changes', callback)
      return
    }

    dbEvents.removeAllListeners()
  }

  /**
   * helper to notify listeners for changes
   * @param {*} data
   */
  _notifyChange = data => {
    const { dbEvents } = this

    log.debug('notifyChange', { data, listeners: dbEvents.listenerCount('changes') })
    dbEvents.emit('changes', data)
  }

  /**
   * write a feed item to offline first db and then encrypt it with remote in background
   * @param {*} feedItem
   */
  async write(feedItem) {
    if (!feedItem.id) {
      log.warn('Feed item missing _id', { feedItem })

      throw new Error('feed item missing id')
    }

    feedItem._id = feedItem.id
    await this.db.Feed.save(feedItem)
    this.encrypt(feedItem).catch(e => {
      log.error('failed saving feedItem to remote', e.message, e)

      this.db.Feed.table.update({ _id: feedItem.id }, { $set: { sync: false } })
    })
  }

  /**
   * read a feed item from offline first db
   * @param {*} id
   * @returns
   */
  // eslint-disable-next-line require-await
  async read(id) {
    return this.db.Feed.findById(id)
  }

  /**
   * find a feeditem of payment link by the payment link id from the blockchain event
   * @param {*} paymentId
   * @returns
   */
  // eslint-disable-next-line require-await
  async readByPaymentId(paymentId) {
    return this.db.Feed.table.get({ 'data.hashedCode': paymentId })
  }

  /**
   * save settings to remote encrypted
   * @param {*} settings
   * @returns
   */
  async encryptSettings(settings) {
    await this._pingRealmDB()

    const msg = new TextEncoder().encode(JSON.stringify(settings))
    const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
    const _id = `${this.user.id}_settings`

    log.debug('encryptSettings:', { settings, encrypted, _id })
    return this.wrapQuery(() =>
      this.encryptedFeed.updateOne(
        { _id, user_id: this.user.id },
        { _id, user_id: this.user.id, encrypted },
        { upsert: true },
      ),
    )
  }

  /**
   * read settings from remote and decrypt
   * @returns
   */
  async decryptSettings() {
    await this._pingRealmDB()

    const _id = `${this.user.id}_settings`
    const encryptedSettings = await this.wrapQuery(() => this.encryptedFeed.findOne({ _id }))
    let settings = {}

    const { encrypted } = encryptedSettings || {}

    if (encrypted) {
      const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(encrypted, 'base64')))

      settings = JSON.parse(new TextDecoder().decode(decrypted))
      log.debug('decryptSettings:', { settings, _id })
    }

    return settings
  }

  /**
   * helper to encrypt feed item in remote
   * @param {*} feedItem
   * @returns
   */
  async encrypt(feedItem): Promise<string> {
    try {
      await this._pingRealmDB()

      const msg = new TextEncoder().encode(JSON.stringify(feedItem))
      const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
      const txHash = feedItem.id
      // eslint-disable-next-line camelcase
      const user_id = this.user.id
      // eslint-disable-next-line camelcase
      const _id = `${txHash}_${user_id}`

      const res = await this.wrapQuery(() =>
        this.encryptedFeed.updateOne(
          { _id, user_id },
          { _id, txHash, user_id, encrypted, date: new Date(feedItem.date || Date.now()) },
          { upsert: true },
        ),
      )

      log.debug('_encrypt result:', { itemId: _id, res })

      return res
    } catch (e) {
      log.error('error _encrypt feedItem:', e.message, e, { feedItem })
    }
  }

  /**
   * helper for decrypting items
   * @param {*} item
   * @returns
   */
  async decrypt(item): Promise<string> {
    try {
      await this._pingRealmDB()

      const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(item.encrypted, 'base64')))

      return JSON.parse(new TextDecoder().decode(decrypted))
    } catch (e) {
      log.warn('failed _decrypt', e.message, e, { item })
    }
  }

  /**
   * get feed page from offline first db
   * @param {*} numResults
   * @param {*} offset
   * @returns
   */
  // eslint-disable-next-line require-await
  async getFeedPage(numResults, offset, category: FeedCategory = FeedCategories.Alls): Promise<any> {
    try {
      const hiddenStates = ['deleted', 'cancelled', 'canceled']
      const categoryMatcher = makeCategoryMatcher(category)

      const res = await this.db.Feed.table
        .orderBy('date')
        .reverse()
        .offset(offset)
        .filter(item => {
          const { status, otplStatus } = item

          if ([status, otplStatus].some(state => hiddenStates.includes(state))) {
            return false
          }

          return categoryMatcher(item)
        })
        .limit(numResults)
        .toArray()

      log.debug('getFeedPage result:', { numResults, offset, len: res.length, res })
      return res
    } catch (e) {
      log.warn('getFeedPage failed:', e.message, e)
      return []
    }
  }

  /**
   * Update or create new user profile
   * @param profile
   * @returns {Promise<Realm.Services.MongoDB.UpdateResult<*>>}
   */
  // eslint-disable-next-line require-await
  async setProfile(profile: Profile): Promise<any> {
    return this.wrapQuery(() =>
      this.profiles.updateOne(
        { user_id: this.user.id },
        { $set: { user_id: this.user.id, ...profile } },
        { upsert: true },
      ),
    )
  }

  /**
   * read the complete raw user profile from realmdb. result fields might be encrypted
   *  @returns {Promise<Profile>}
   */
  // eslint-disable-next-line require-await
  async getProfile(): Promise<Profile> {
    return this.wrapQuery(() => this.profiles.findOne({ user_id: this.user.id }))
  }

  /**
   * get user profile from realmdb. result fields might be encrypted
   * @param query
   * @returns {Promise<Profile>}
   */
  // eslint-disable-next-line require-await
  async getProfileBy(query: Object): Promise<Profile> {
    return this.wrapQuery(() => this.profiles.findOne(query))
  }

  /**
   * get users profiles from realmdb. result fields might be encrypted
   * @param query
   * @returns {Promise<Array<Profile>>}
   */
  // eslint-disable-next-line require-await
  async getProfilesBy(query: Object): Promise<Array<Profile>> {
    return this.wrapQuery(() => this.profiles.find(query))
  }

  /**
   * Removing the field from record
   * @param field
   * @returns {Promise<Realm.Services.MongoDB.UpdateResult<*>>}
   */
  // eslint-disable-next-line require-await
  async removeField(field: string): Promise<any> {
    return this.wrapQuery(() => this.profiles.updateOne({ user_id: this.user.id }, { $unset: { [field]: true } }))
  }

  /**
   * deletes both local and remote storage
   * @returns {Promise<[void, Realm.Services.MongoDB.DeleteResult]>}
   */
  // eslint-disable-next-line require-await
  async deleteAccount(): Promise<any> {
    const clearFeedPromise = this.wrapQuery(() => this.encryptedFeed.deleteMany({ user_id: this.user.id }))

    return Promise.all([this.db.delete(), clearFeedPromise])
  }

  /**
   * Removing user profile
   * @returns {Promise<Realm.Services.MongoDB.DeleteResult>}
   */
  // eslint-disable-next-line require-await
  async deleteProfile(): Promise<boolean> {
    return this.wrapQuery(() => this.profiles.deleteOne({ user_id: this.user.id }))
  }

  /**
   *
   * @param {string} recipientPublicKey
   * @param {string} txHash
   * @param {string} encrypted
   */
  // eslint-disable-next-line require-await
  async addToOutbox(recipientPublicKey: string, txHash: string, encrypted: string): Promise<any> {
    return this.wrapQuery(() =>
      this.inboxes.insertOne({ user_id: this.user.id, recipientPublicKey, txHash, encrypted }),
    )
  }

  /**
   *
   * @param {string} txHash
   * @returns {Promise<TransactionDetails>}
   */
  async getFromOutbox(recipientPublicKey: string, txHash: string): Promise<TransactionDetails> {
    const data = await this.wrapQuery(() => this.inboxes.findOne({ txHash, recipientPublicKey }))
    const decrypted = await this.decrypt(data)

    return decrypted
  }
}

export default once(() => new RealmDB())
