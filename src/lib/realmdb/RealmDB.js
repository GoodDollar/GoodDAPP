//@flow
import { Collection, Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'
import { get, once, sortBy } from 'lodash'
import * as Realm from 'realm-web'
import Config from '../../config/config'
import { JWT } from '../constants/localStorage'
import logger from '../logger/pino-logger'
import { FeedItemSchema } from '../textile/feedSchema' // Some json-schema.org schema
import type { ProfileDB } from '../userStorage/UserProfileStorage'
import type { DB } from '../userStorage/UserStorage'
import AsyncStorage from '../utils/asyncStorage'

const log = logger.child({ from: 'RealmDB' })
class RealmDB implements DB, ProfileDB {
  privateKey

  db: Database

  isReady = false

  listeners = []

  Feed: Collection

  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * basic initialization
   * @param {*} pkeySeed
   * @param {*} publicKeyHex
   */
  async init(privateKey: TextileCrypto.PrivateKey) {
    try {
      this.db = new Database(`feed_${privateKey.public.toString()}`, {
        name: 'Feed',
        schema: FeedItemSchema,
        indexes: [{ path: 'date' }, { path: 'data.hashedCode' }],
      })
      this.privateKey = privateKey
      await this.db.open(1) // Versioned db on open
      this.Feed = this.db.collection('Feed')
      this.Feed.table.hook('updating', (modify, id, event) => this._notifyChange({ modify, id, event }))
      this.Feed.table.hook('creating', (id, event) => this._notifyChange({ id, event }))
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
    log.debug('initRealmDB', { jwt, REALM_APP_ID })
    const credentials = Realm.Credentials.jwt(jwt)
    try {
      // Authenticate the user
      const app = new Realm.App({ id: REALM_APP_ID })
      this.user = await app.logIn(credentials)
      const mongodb = app.currentUser.mongoClient('mongodb-atlas')
      this.database = mongodb.db(this._databaseName)

      // `App.currentUser` updates to match the logged in user
      log.debug('realm logged in', { user: this.user })
      this._syncFromRemote()
      return this.user
    } catch (err) {
      log.error('Failed to log in', err)
      throw err
    }
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

  /**
   * sync between devices.
   * used in Appswitch to sync with remote when user comes back to app
   */
  async _syncFromRemote() {
    // this.Feed.
    const lastSync = await this.Feed.table //use dexie directly because mongoify only sorts results and not all documents
      .orderBy('date')
      .reverse()
      .limit(1)
      .toArray()
      .then(r => get(r, '[0].date', 0))
    const newItems = await this.encryptedFeed.find({
      user_id: this.user.id,
      date: { $gt: new Date(lastSync) },
    })
    const filtered = newItems.filter(_ => !_._id.toString().includes('settings') && _.txHash)
    log.debug('_syncFromRemote', { newItems, filtered, lastSync })
    if (filtered.length) {
      let decrypted = await Promise.all(filtered.map(i => this._decrypt(i)))
      log.debug('_syncFromRemote', { decrypted })
      await this.Feed.save(...decrypted)
    }

    //sync items that we failed to save
    const failedSync = await this.Feed.find({ sync: false }).toArray()
    if (failedSync.length) {
      log.debug('_syncFromRemote: saving failed items', failedSync.length)
      failedSync.forEach(async item => {
        await this._encrypt(item)
        this.Feed.table.update({ _id: item.id }, { $set: { sync: true } })
      })
    }
    log.info('_syncfromremote done')
  }

  /**
   * helper for testing migration from gundb
   * TODO: remove
   */
  async _syncFromLocalStorage() {
    await this.Feed.clear()
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
   * @param {*} cb
   */
  on(cb) {
    this.listeners.push(cb)
  }

  /**
   * unsubscribe listener
   * @param {*} cb
   */
  off(cb) {
    this.listeners = this.listeners.filter(_ => _ !== cb)
  }

  /**
   * helper to notify listeners for changes
   * @param {*} data
   */
  _notifyChange = data => {
    log.debug('notifyChange', { data, listeners: this.listeners.length })
    this.listeners.map(cb => cb(data))
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
    await this.Feed.save(feedItem)
    this._encrypt(feedItem).catch(e => {
      log.error('failed saving feedItem to remote', e.message, e)
      this.Feed.table.update({ _id: feedItem.id }, { $set: { sync: false } })
    })

    // this.db.remote.push('Feed').catch(e => log.error('remote push failed', e.message, e))
  }

  /**
   * read a feed item from offline first db
   * @param {*} id
   * @returns
   */
  // eslint-disable-next-line require-await
  async read(id) {
    return this.Feed.findById(id)
  }

  /**
   * find a feeditem of payment link by the payment link id from the blockchain event
   * @param {*} paymentId
   * @returns
   */
  // eslint-disable-next-line require-await
  async readByPaymentId(paymentId) {
    return this.Feed.table.get({ 'data.hashedCode': paymentId })
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
    if (encryptedSettings) {
      const { encrypted } = encryptedSettings
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
  async _encrypt(feedItem): Promise<any> {
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
        { _id, txHash, user_id, encrypted, date: new Date(feedItem.date) },
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
    const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(item.encrypted, 'base64')))
    return JSON.parse(new TextDecoder().decode(decrypted))
  }

  /**
   * get feed page from offline first db
   * @param {*} numResults
   * @param {*} offset
   * @returns
   */
  // eslint-disable-next-line require-await
  async getFeedPage(numResults, offset): Promise<any> {
    const res = await this.Feed.table //use dexie directly because mongoify only sorts results and not all documents
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

    log.debug('getFeedPage result:', numResults, offset, res.length, res)
    return res
  }

  // eslint-disable-next-line require-await
  async setProfile(profile: { [key: string]: ProfileField }): Promise<any> {
    return this.profiles.updateOne(
      { user_id: this.user.id },
      { $set: { user_id: this.user.id, ...profile } },
      { upsert: true },
    )
  }

  /**
   * read the complete raw user profile from realmdb. result fields might be encrypted
   *  @returns {Promise<any>}
   */
  // eslint-disable-next-line require-await
  async getProfile(): Promise<Profile> {
    return this.profiles.findOne({ user_id: this.user.id })
  }

  /**
   * get user profile from realmdb. result fields might be encrypted
   * @param key
   * @param field
   * @returns {Promise<any | null>}
   */
  // eslint-disable-next-line require-await
  async getProfileBy(query: object): Promise<Profile> {
    return this.profiles.findOne(query)
  }

  // eslint-disable-next-line require-await
  async getProfilesBy(query: object): Promise<Array<Profile>> {
    return this.profiles.find(query)
  }

  /**
   * Set profile fields
   * @param fields
   * @returns {Promise<Realm.Services.MongoDB.UpdateResult<any>>}
   */
  // eslint-disable-next-line require-await
  async setProfileFields(fields: Profile): Promise<void> {
    return this.setProfile(fields)
  }

  /**
   * Removing the field from record
   * @param field
   * @returns {Promise<Realm.Services.MongoDB.UpdateResult<*>>}
   */
  // eslint-disable-next-line require-await
  async removeField(field: string): Promise<any> {
    return this.profiles.updateOne({ user_id: this.user.id }, { $unset: { [field]: true } })
  }

  /**
   * deletes both local and remote storage
   * @returns
   */
  // eslint-disable-next-line require-await
  async deleteAccount(): Promise<void> {
    return Promise.all([this.db.delete(), this.encryptedFeed.deleteMany({ user_id: this.user.id })])
  }

  /**
   * Removing user profile
   * @returns {Promise<any | null>}
   */
  // eslint-disable-next-line require-await
  async deleteProfile(): Promise<boolean> {
    return this.profiles.deleteOne({ user_id: this.user.id })
  }
}

export default once(() => new RealmDB())
