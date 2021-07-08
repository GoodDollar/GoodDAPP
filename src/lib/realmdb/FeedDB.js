import * as Realm from 'realm-web'
import { Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'
import { once, sortBy } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import { JWT } from '../constants/localStorage'
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'
import { FeedItemSchema } from '../textile/feedSchema' // Some json-schema.org schema

const log = logger.child({ from: 'FeedRealmDB' })

class FeedDB {
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

  on(cb) {
    this.listeners.push(cb)
  }

  off(cb) {
    this.listeners = this.listeners.filter(_ => _ !== cb)
  }

  notifyChange = data => {
    log.debug('notifyChange', { data, listeners: this.listeners.length })
    this.listeners.map(cb => cb(data))
  }

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
      this.Feed.table.hook('updating', this.notifyChange)
      this.Feed.table.hook('creating', this.notifyChange)
      await this.initRealmDB()

      // this._update()
      // if ((await this.Feed.count()) === 0) {
      // await this._syncFromLocalStorage()
      this.resolve()
      this.isReady = true
    } catch (e) {
      log.error('failed initializing', e.message, e)
      this.reject(e)
    }

    // }
    // this.initRemote().catch(e => log.error('initRemote failed', e.message, e))
  }

  async initRealmDB() {
    const REALM_APP_ID = Config.realmAppID || 'wallet_dev-dhiht'

    const app = new Realm.App({ id: REALM_APP_ID })
    const jwt = await AsyncStorage.getItem(JWT)
    log.debug('initRealmDB', { jwt, REALM_APP_ID })
    const credentials = Realm.Credentials.jwt(jwt)
    try {
      // Authenticate the user
      this.user = await app.logIn(credentials)
      const mongodb = app.currentUser.mongoClient('mongodb-atlas')
      this.EncryptedFeed = mongodb.db('wallet').collection('encrypted_feed')

      // `App.currentUser` updates to match the logged in user
      log.debug('realm logged in', { user: this.user })
      return this.user
    } catch (err) {
      log.error('Failed to log in', err)
      throw err
    }
  }

  async _update() {
    const items = await this.Feed.find().toArray()
    items.forEach(i => this.encrypt(i))
  }

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
  }

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

  async write(feedItem) {
    if (!feedItem.id) {
      log.warn('Feed item missing _id', { feedItem })
      throw new Error('feed item missing id')
    }
    feedItem._id = feedItem.id
    await this.Feed.save(feedItem)
    this.encrypt(feedItem)

    // this.db.remote.push('Feed').catch(e => log.error('remote push failed', e.message, e))
  }

  // eslint-disable-next-line require-await
  async read(id) {
    return this.Feed.findById(id)
  }

  // eslint-disable-next-line require-await
  async readByPaymentId(paymentId) {
    return this.Feed.table.where({ 'data.hashedCode': paymentId }).toArray()
  }

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

  async encrypt(feedItem) {
    const msg = new TextEncoder().encode(JSON.stringify(feedItem))
    const encrypted = await this.privateKey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
    const txHash = feedItem.id
    // eslint-disable-next-line camelcase
    const user_id = this.user.id
    // eslint-disable-next-line camelcase
    const _id = `${txHash}_${user_id}`
    return this.EncryptedFeed.updateOne(
      { _id, txHash, user_id },
      { _id, txHash, user_id, encrypted, date: new Date(feedItem.date) },
      { upsert: true },
    )
  }

  async decrypt(id) {
    try {
      const _id = `${id}_${this.user.id}`
      const item = await this.EncryptedFeed.findOne({ _id, user_id: this.user.id })
      return this._decrypt(item)
    } catch (e) {
      log.warn('unable to decrypt item:', id)
    }
  }

  async _decrypt(item) {
    const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(item.encrypted, 'base64')))
    const res = JSON.parse(new TextDecoder().decode(decrypted))
    return res
  }

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
}

export default once(() => new FeedDB())
