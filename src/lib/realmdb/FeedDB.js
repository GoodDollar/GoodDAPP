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

  db = new Database(
    'feed',
    { name: 'Feed', schema: FeedItemSchema, indexes: [{ path: 'date' }, { path: 'data.hashedCode' }] },
    { name: 'EncryptedFeed' },
  )

  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  async init(pkeySeed, publicKey) {
    try {
      const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
      this.privateKey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
      this.publicKey = publicKey
      await this.db.open(1) // Versioned db on open
      this.Feed = this.db.collection('Feed')
      await this.initRealmDB()

      // if ((await this.Feed.count()) === 0) {
      // await this._syncFromLocalStorage()
      this.resolve()
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

  async _syncFromLocalStorage() {
    await this.Feed.clear()
    let items = await AsyncStorage.getItem('GD_feed').then(_ => Object.values(_ || {}))
    items.forEach(i => {
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
      { user_id: this.user.id, encrypted },
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

    return this.EncryptedFeed.updateOne({ txHash, user_id }, { txHash, user_id, encrypted }, { upsert: true })
  }

  async decrypt(id) {
    const { encrypted } = await this.EncryptedFeed.findOne({ txHash: id, user_id: this.user.id })
    const decrypted = await this.privateKey.decrypt(Uint8Array.from(Buffer.from(encrypted, 'base64')))
    const item = JSON.parse(new TextDecoder().decode(decrypted))
    return item
  }

  // // eslint-disable-next-line require-await
  // async getFeedPage(numResults, offset) {
  //   const res = await this.Feed.find({
  //     $and: [
  //       { status: { $nin: ['deleted', 'cancelled', 'canceled'] } },
  //       { otplStatus: { $nin: ['deleted', 'cancelled', 'canceled'] } },
  //     ],
  //   })
  //     .reverse()
  //     .offset(offset)
  //     .limit(numResults)
  //     .sortBy('date')

  //   log.debug('getFeedPage result:', numResults, offset, res.length, res)
  //   return res
  //   // .toArray()
  // }

  // eslint-disable-next-line require-await
  async getFeedPage(numResults, offset) {
    const res = await this.Feed.table
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

    //   $and: [
    //     { status: { $nin: ['deleted', 'cancelled', 'canceled'] } },
    //     { otplStatus: { $nin: ['deleted', 'cancelled', 'canceled'] } },
    //   ],
    // })
    //   .reverse()
    //   .offset(offset)
    //   .limit(numResults)
    //   .sortBy('date')

    log.debug('getFeedPage result:', numResults, offset, res.length, res)
    return res
  }
}

export default once(() => new FeedDB())
