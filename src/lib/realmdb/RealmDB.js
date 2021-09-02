//@flow
import { once, sortBy } from 'lodash'
import * as Realm from 'realm-web'
import TextileCrypto from '@textile/crypto'
import EventEmitter from 'eventemitter3'
import { JWT } from '../constants/localStorage'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import type { TransactionDetails } from '../userStorage/FeedStorage'
import type { ThreadDB } from '../textile/ThreadDB'
import type { ProfileDB } from '../userStorage/UserProfileStorage'
import type { DB } from '../userStorage/UserStorage'
import type { Profile } from '../userStorage/UserStorageClass'
import AsyncStorage from '../utils/asyncStorage'

const log = logger.child({ from: 'RealmDB' })

class RealmDB implements DB, ProfileDB {
  db: ThreadDB

  database: Realm.Services.MongoDB

  privateKey: TextileCrypto.PrivateKey

  isReady: boolean = false

  dbEvents = new EventEmitter()

  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * basic initialization
   * @param db
   */
  async init(db: ThreadDB) {
    try {
      const { privateKey, Feed } = db

      this.privateKey = privateKey
      this.db = db

      Feed.table.hook('creating', (id, event) => this._notifyChange({ id, event }))
      Feed.table.hook('updating', (modify, id, event) => this._notifyChange({ modify, id, event }))
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
    const REALM_APP_ID = Config.realmAppID
    const jwt = await AsyncStorage.getItem(JWT)
    const credentials = Realm.Credentials.jwt(jwt)

    log.debug('initRealmDB', { jwt, REALM_APP_ID })

    try {
      // Authenticate the user
      const app = new Realm.App({ id: REALM_APP_ID })
      const user = await app.logIn(credentials)
      const mongodb = app.currentUser.mongoClient('mongodb-atlas')

      // `App.currentUser` updates to match the logged in user
      log.debug('realm logged in', { user })

      this.user = user
      this.database = mongodb.db(this._databaseName)

      this._syncFromRemote().catch(e => log.warn('_syncFromRemote failed:', e.message, e))
      return this.user
    } catch (err) {
      log.error('Failed to log in', err)
      throw err
    }
  }

  /**
   * Helper to wait between retries
   * @param millSeconds
   * @returns {Promise<unknown>}
   */
  waitFor(millSeconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, millSeconds)
    })
  }

  /**
   * Function for retry call
   * @param callback - query
   * @param nthTry -
   * @param delay - delay time between retries
   * @returns {Promise<unknown>}
   */
  async retry(callback, nthTry, delay) {
    try {
      const data = await callback()
      log.debug(`Successfully retry a call, ${callback}`)
      return data
    } catch (e) {
      if (nthTry === 1) {
        log.error('Failed to retry a call', callback)
        return Promise.reject(e)
      }
      log.debug(`Failed to retry a call, trying again, ${nthTry} time`)
      await this.waitFor(delay)
      return this.retry(callback, nthTry - 1, delay)
    }
  }

  /**
   * helper for reconnecting to realmDB
   * @private
   */
  async _reconnectToRealm(): void {
    if (this.database === undefined) {
      log.debug('trying reconnect to realmDB')
      try {
        await this._initRealmDB()
        log.debug('Successfully reconnect to realmDB')
      } catch (e) {
        log.error('there was an error with reconnecting', e)
        await this.retry(() => this._initRealmDB(), 4, 2000)
      }
    }
  }

  /**
   * helper for getting realmDB collection
   * @param name
   * @returns {Realm.Services.MongoDB.MongoDBCollection<any>}
   * @private
   */
  _getCollection(name) {
    return this.database.collection(name)
  }

  /**
   * helper to resolve issue with toJSON error in console
   * @returns {Realm.Services.MongoDB.MongoDBCollection<any>}
   * @private
   */
  get encryptedFeed() {
    return this._getCollection('encrypted_feed')
  }

  /**
   * getter to resolve issue with toJSON error in console
   * @returns {Realm.Services.MongoDB.MongoDBCollection<any>}
   * @private
   */
  get profiles() {
    return (async () => {
      try {
        return this._getCollection('user_profiles')
      } catch (e) {
        log.error('failed to get profile collection', e)
        await this._reconnectToRealm()
        return this._getCollection('user_profiles')
      }
    })()
  }

  get inboxes() {
    return (async () => {
      try {
        return this._getCollection('inboxes')
      } catch (e) {
        log.error('failed to get inboxes collection', e)
        await this._reconnectToRealm()
        return this._getCollection('inboxes')
      }
    })()
  }

  /**
   * sync between devices.
   * used in Appswitch to sync with remote when user comes back to app
   */
  async _syncFromRemote() {
    const lastSync = (await AsyncStorage.getItem('GD_lastRealmSync')) || 0
    const newItems = await this.encryptedFeed.find({
      user_id: this.user.id,
      date: { $gt: new Date(lastSync) },
    })

    const filtered = newItems.filter(_ => !_._id.toString().includes('settings') && _.txHash)

    log.debug('_syncFromRemote', { newItems, filtered, lastSync })

    if (filtered.length) {
      let decrypted = (await Promise.all(filtered.map(i => this._decrypt(i)))).filter(_ => _)
      log.debug('_syncFromRemote', { decrypted })

      await this.db.Feed.save(...decrypted)
    }
    AsyncStorage.setItem('GD_lastRealmSync', Date.now())

    //sync items that we failed to save
    const failedSync = await this.db.Feed.find({ sync: false }).toArray()

    if (failedSync.length) {
      log.debug('_syncFromRemote: saving failed items', failedSync.length)

      failedSync.forEach(async item => {
        await this._encrypt(item)

        this.db.Feed.table.update({ _id: item.id }, { $set: { sync: true } })
      })
    }

    log.info('_syncfromremote done')
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
    this._encrypt(feedItem).catch(e => {
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
    const msg = new TextEncoder().encode(JSON.stringify(settings))
    const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
    const _id = `${this.user.id}_settings`

    log.debug('encryptSettings:', { settings, encrypted, _id })

    return this.encryptedFeed.updateOne(
      { _id, user_id: this.user.id },
      { _id, user_id: this.user.id, encrypted },
      { upsert: true },
    )
  }

  /**
   * read settings from remote and decrypt
   * @returns
   */
  async decryptSettings() {
    const _id = `${this.user.id}_settings`
    const encryptedSettings = await this.encryptedFeed.findOne({ _id })
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
  async _encrypt(feedItem): Promise<string> {
    try {
      const msg = new TextEncoder().encode(JSON.stringify(feedItem))
      const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
      const txHash = feedItem.id
      // eslint-disable-next-line camelcase
      const user_id = this.user.id
      // eslint-disable-next-line camelcase
      const _id = `${txHash}_${user_id}`
      const res = await this.encryptedFeed.updateOne(
        { _id, user_id },
        { _id, txHash, user_id, encrypted, date: new Date(feedItem.date || Date.now()) },
        { upsert: true },
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
  async _decrypt(item): Promise<string> {
    try {
      const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(item.encrypted, 'base64')))

      return JSON.parse(new TextDecoder().decode(decrypted))
    } catch (e) {
      log.warn('failed _decrypt', { item })
    }
  }

  /**
   * get feed page from offline first db
   * @param {*} numResults
   * @param {*} offset
   * @returns
   */
  // eslint-disable-next-line require-await
  async getFeedPage(numResults, offset): Promise<any> {
    try {
      // use dexie directly because mongoify only sorts results and not all documents
      const res = await this.db.Feed.table
        .orderBy('date')
        .reverse()
        .offset(offset)
        .filter(
          i =>
            ['deleted', 'cancelled', 'canceled'].includes(i.status) === false &&
            ['deleted', 'cancelled', 'canceled'].includes(i.otplStatus) === false,
        )
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
    const profiles = await this.profiles
    const query = () =>
      profiles.updateOne({ user_id: this.user.id }, { $set: { user_id: this.user.id, ...profile } }, { upsert: true })
    try {
      const result = query()
      const { matchedCount, modifiedCount } = result
      if (matchedCount && modifiedCount) {
        log.debug(`Successfully set a  profile.`)
      }
      return result
    } catch (e) {
      log.error(`Failed to set profile: ${e}`)
      await this.retry(() => query(), 4, 2000)
    }
  }

  /**
   * Helper for getProfile methods, to add logs
   * @param query
   * @returns {Promise<*>}
   * @private
   */
  // eslint-disable-next-line require-await
  async _logProfileQueryStatus(query): Promise<Profile> {
    try {
      const result = await query()
      if (result) {
        log.debug(`Successfully found profile: ${result}.`)
      } else {
        log.debug('No profile matches the provided query.')
      }
      return result
    } catch (e) {
      log.error(`Failed to find profile: ${e}`)
    }
  }

  /**
   * read the complete raw user profile from realmdb. result fields might be encrypted
   *  @returns {Promise<Profile>}
   */
  // eslint-disable-next-line require-await
  async getProfile(): Promise<Profile> {
    const profiles = await this.profiles
    return this._logProfileQueryStatus(() => profiles.findOne({ user_id: this.user.id }))
  }

  /**
   * get user profile from realmdb. result fields might be encrypted
   * @param query
   * @returns {Promise<Profile>}
   */
  // eslint-disable-next-line require-await
  async getProfileBy(query: Object): Promise<Profile> {
    const profiles = await this.profiles
    return this._logProfileQueryStatus(() => profiles.findOne(query))
  }

  /**
   * get users profiles from realmdb. result fields might be encrypted
   * @param query
   * @returns {Promise<Array<Profile>>}
   */
  // eslint-disable-next-line require-await
  async getProfilesBy(query: Object): Promise<Array<Profile>> {
    const profiles = await this.profiles
    return this._logProfileQueryStatus(() => profiles.find(query))
  }

  /**
   * Removing the field from record
   * @param field
   * @returns {Promise<Realm.Services.MongoDB.UpdateResult<*>>}
   */
  // eslint-disable-next-line require-await
  async removeField(field: string): Promise<any> {
    const profiles = await this.profiles
    const query = profiles.updateOne({ user_id: this.user.id }, { $unset: { [field]: true } })
    try {
      const result = await query()
      const { matchedCount, modifiedCount } = result
      if (matchedCount && modifiedCount) {
        log.debug(`Successfully remove field.`)
      }
      return result
    } catch (e) {
      log.error(`Failed to remove field: ${e}`)
      await this.retry(() => query(), 4, 2000)
    }
  }

  /**
   * deletes both local and remote storage
   * @returns {Promise<[void, Realm.Services.MongoDB.DeleteResult]>}
   */
  // eslint-disable-next-line require-await

  async deleteAccount(): Promise<any> {
    const query = () => this.encryptedFeed.deleteMany({ user_id: this.user.id })
    try {
      await Promise.all([this.db.delete(), query()])
      log.debug(`Delete account successful`)
      return true
    } catch (e) {
      log.error(`Delete account failed with error: ${e}`)
      await this.retry(() => query(), 4, 2000)
    }
  }

  /**
   * Removing user profile
   * @returns {Promise<Realm.Services.MongoDB.DeleteResult>}
   */
  // eslint-disable-next-line require-await
  async deleteProfile(): Promise<boolean> {
    const profiles = await this.profiles
    const query = () => profiles.deleteOne({ user_id: this.user.id })
    try {
      const result = await query()
      log.debug(`Deleted ${result.deletedCount} profile.`)
      return result
    } catch (e) {
      log.error(`Delete profile failed with error: ${e}`)
      await this.retry(() => query(), 4, 2000)
    }
  }

  /**
   *
   * @param {string} recipientPublicKey
   * @param {string} txHash
   * @param {string} encrypted
   */
  // eslint-disable-next-line require-await
  async addToOutbox(recipientPublicKey: string, txHash: string, encrypted: string): Promise<any> {
    const inboxes = await this.inboxes
    const query = () => inboxes.insertOne({ user_id: this.user.id, recipientPublicKey, txHash, encrypted })
    try {
      const result = await query
      log.debug(`Successfully inserted item with _id: ${result.insertedId}`)
      return result
    } catch (e) {
      log.error(`Failed to insert item: ${e}`)
      await this.retry(() => query(), 4, 2000)
    }
  }

  /**
   *
   * @param recipientPublicKey
   * @param {string} txHash
   * @returns {Promise<TransactionDetails>}
   */
  async getFromOutbox(recipientPublicKey: string, txHash: string): Promise<TransactionDetails> {
    try {
      const inboxes = await this.inboxes
      const result = inboxes.findOne({ txHash, recipientPublicKey })
      if (result) {
        log.debug(`Successfully found document: ${result}.`)
      } else {
        log.debug('No document matches the provided query.')
      }
      const decrypted = await this._decrypt(result)
      return decrypted
    } catch (e) {
      log.error(`Failed to find document: ${e}`)
    }
  }
}

export default once(() => new RealmDB())
