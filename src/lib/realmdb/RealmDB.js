//@flow
import { Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'
import { get, isFunction, once, sortBy } from 'lodash'
import * as Realm from 'realm-web'
import { getUserModel } from '../gundb/UserModel'
import type { UserModel } from '../gundb/UserModel'
import AsyncStorage from '../utils/asyncStorage'
import { JWT } from '../constants/localStorage'
import logger from '../logger/pino-logger'
import Config from '../../config/config'
import { FeedItemSchema } from '../textile/feedSchema' // Some json-schema.org schema
import type { DB } from '../userStorage/UserStorage'
import type { ProfileDB } from '../userStorage/UserProfileStorage'

const log = logger.child({ from: 'FeedRealmDB' })
class RealmDB implements DB, ProfileDB {
  privateKey

  publicKey

  db

  isReady = false

  listeners = []

  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * basic initialization
   * @param {*} pkeySeed
   * @param {*} publicKey
   */
  async init(pkeySeed, publicKey) {
    try {
      this.db = new Database(`feed_${publicKey}`, {
        name: 'Feed',
        schema: FeedItemSchema,
        indexes: [{ path: 'date' }, { path: 'data.hashedCode' }],
      })
      const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
      this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
      this.publicKey = publicKey
      await this.db.open(1) // Versioned db on open
      this.Feed = this.db.collection('Feed')
      this.Feed.table.hook('updating', this._notifyChange)
      this.Feed.table.hook('creating', this._notifyChange)
      await this._initRealmDB()
      this.resolve()
      this.isReady = true
    } catch (e) {
      log.error('failed initializing', e.message, e)
      this.reject(e)
    }
  }

  /**
   * helper to initialize with realmdb using JWT token
   * @returns
   */
  async _initRealmDB() {
    const REALM_APP_ID = Config.realmAppID || 'wallet_dev-dhiht'
    const jwt = await AsyncStorage.getItem(JWT)
    log.debug('initRealmDB', { jwt, REALM_APP_ID })
    const credentials = Realm.Credentials.jwt(jwt)
    try {
      // Authenticate the user
      const app = new Realm.App({ id: REALM_APP_ID })
      this.user = await app.logIn(credentials)
      const mongodb = app.currentUser.mongoClient('mongodb-atlas')
      this.EncryptedFeed = mongodb.db('wallet').collection('encrypted_feed')
      this.Profiles = mongodb.db('wallet').collection('user_profiles')

      // `App.currentUser` updates to match the logged in user
      log.debug('realm logged in', { user: this.user })
      return this.user
    } catch (err) {
      log.error('Failed to log in', err)
      throw err
    }
  }

  /**
   * sync between devices.
   * used in Appswitch to sync with remote when user comes back to app
   */
  async _syncFromRemote() {
    const lastSync = (await AsyncStorage.getItem('GD_lastRealmSync')) || 0
    const newItems = await this.EncryptedFeed.find({
      user_id: this.user.id,
      txHash: { $exists: true },
      date: { $gte: new Date(lastSync) },
    })
    const filtered = newItems.filter(_ => !_._id.toString().includes('settings'))
    log.debug('_syncFromRemote', { newItems, filtered, lastSync })
    if (filtered.length) {
      let decrypted = await Promise.all(filtered.map(i => this._decrypt(i)))
      log.debug('_syncFromRemote', { decrypted })
      await this.Feed.save(...decrypted)
      AsyncStorage.setItem('GD_lastRealmSync', Date.now())
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
    return this.Feed.table.where({ 'data.hashedCode': paymentId }).toArray()
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
    return this.EncryptedFeed.updateOne(
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
    const encryptedSettings = await this.EncryptedFeed.findOne({ _id })
    let settings = {}
    if (encryptedSettings) {
      const { encrypted } = encryptedSettings
      const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(encrypted, 'base64')))
      settings = JSON.parse(new TextDecoder().decode(decrypted))
      log.debug('decrypttSettings:', { settings, _id })
    }
    return settings
  }

  /**
   * helper to encrypt feed item in remote
   * @param {*} feedItem
   * @returns
   */
  async _encrypt(feedItem) {
    try {
      const msg = new TextEncoder().encode(JSON.stringify(feedItem))
      const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
      const txHash = feedItem.id
      // eslint-disable-next-line camelcase
      const user_id = this.user.id
      // eslint-disable-next-line camelcase
      const _id = `${txHash}_${user_id}`
      const res = await this.EncryptedFeed.updateOne(
        { _id, txHash, user_id },
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
  async _decrypt(item) {
    const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(item.encrypted, 'base64')))
    const res = JSON.parse(new TextDecoder().decode(decrypted))
    return res
  }

  /**
   * get feed page from offline first db
   * @param {*} numResults
   * @param {*} offset
   * @returns
   */
  // eslint-disable-next-line require-await
  async getFeedPage(numResults, offset) {
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

  //TODO:  make sure profile contains walletaddress or enforce it in schema in realmdb
  setProfile(profile) {
    this.Profiles.updateOne({ user_id: this.user.id }, { user_id: this.user.id, ...profile }, { upsert: true })
  }

  getProfile() {
    return this.Profiles.findOne({ user_id: this.user.id })
  }

  getProfileByWalletAddress(walletAddress: string) {
    return this.Profiles.findOne({ walletAddress })
  }

  setProfileFields(fields: { key: String, field: ProfileField }) {
    return this.Profiles.updateOne({ user_id: this.user.id }, { $set: fields })
  }

  removeAvatar(withCleanup?: boolean) {
    // eslint-disable-next-line require-await
    const updateRealmDB = async () => this.setProfileFields({ avatar: null })
    if (withCleanup !== true) {
      return updateRealmDB()
    }
    return this.setProfileFields({ avatar: null })
  }

  _storeAvatar(field: string, avatar: string, withCleanup = false) {
    // eslint-disable-next-line require-await
    const updateRealmDB = async () => this.setProfileFields({ [field]: avatar })
    if (withCleanup !== true) {
      return updateRealmDB()
    }

    return this.setProfileFields({ [field]: avatar })
  }

  async _removeBase64(field: string, updateGUNCallback = null) {
    if (isFunction(updateGUNCallback)) {
      await updateGUNCallback()
    }
  }

  initProfile() {}

  getProfileFieldValue(field: string) {
    return this.getProfile().then(data => data[field].value)
  }

  getProfileFieldDisplayValue(field: string) {
    return this.getProfile().then(data => data[field].display)
  }

  getProfileField(field: string) {
    return this.getProfile().then(data => data[field])
  }

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

  getFieldPrivacy(field: string) {
    return this.getProfile().then(data => data[field].privacy)
  }

  // validateProfile(
  //   profile: any,
  // ): Promise<{
  //   isValid: boolean,
  //   errors: {},
  // }>
  // setProfileField(field: string, value: string, privacy?: FieldPrivacy, onlyPrivacy?: boolean): Promise<ACK>;
  // // indexProfileField(field: string, value: string, privacy: FieldPrivacy): Promise<ACK>;
  // setProfileFieldPrivacy(field: string, privacy: FieldPrivacy): Promise<ACK>;
  // isUsername(username: string): Promise<boolean>;
  // // getUserProfilePublickey(value: string): Promise<any>;
  // // getUserAddress(field: string): string;
  // getUserProfile(field?: string): { name: String, avatar: String };
  // // _getProfileNodeTrusted(initiatorType, initiator, address): Gun
  // // _getProfileNode(initiatorType, initiator, address): Gun
  // getProfile(): Promise<any>;
  // // getEncryptedProfile(profileNode): Promise<any>;
  // // getPublicProfile(): Promise<any>;
  // deleteProfile(): Promise<boolean>;
  // // deleteAccount(): Promise<boolean>;
}

export default once(() => new RealmDB())
