//@flow
import { Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'
import { once, sortBy } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import logger from '../logger/js-logger'
import Config from '../../config/config'
import type { DB } from '../userStorage/UserStorage'

import { FeedItemSchema } from './feedSchema' // Some json-schema.org schema

const log = logger.get('FeedThreadDB')

class TextileDB implements DB {
  db = new Database(
    'demo5',
    { name: 'Feed', schema: FeedItemSchema, indexes: [{ path: 'date' }, { path: 'data.hashedCode' }] },
    { name: 'EncryptedFeed' },
  )

  pkey

  async init(privateKey, publicKey) {
    log.debug({ privateKey })
    const seed = Uint8Array.from(Buffer.from(privateKey, 'hex'))
    this.pkey = TextileCrypto.PrivateKey.fromRawEd25519Seed(seed)
    await this.db.open(2) // Versioned db on open
    this.Feed = this.db.collection('Feed')
    this.EncryptedFeed = this.db.collection('EncryptedFeed')

    // if ((await this.Feed.count()) === 0) {
    // await this._syncFromLocalStorage()
    // }
    this.initRemote().catch(e => log.error('initRemote failed', e.message, e))
  }

  async initRemote() {
    const keyInfo = { key: Config.textileKey, secret: Config.textileSecret }
    log.debug({ keyInfo })
    const remote = await this.db.remote.setKeyInfo(keyInfo)
    const token = await remote.authorize(this.pkey)
    log.debug('Textile remote token', { token })

    // const feedThreadId = ThreadID.fromString('626e627378736c62616e6278786f69646a6f6d7167733562616d35787773337468')
    // Buffer.from(this.pkey.pubKey).toString('hex')
    // log.debug({ feedThreadId })
    const threadId = await remote.initialize() // Create random thread
    log.debug('Textile remote threadId', { threadId })
    const pulledKeys = await remote.pull('EncryptedFeed')
    log.debug('pulled keys from remote', { pulledKeys })
  }

  on() {}

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
    feedItem._id = feedItem._id || feedItem.id
    if (!feedItem._id) {
      throw new Error('feed item missing id')
    }
    await this.Feed.save(feedItem)
    this.encrypt(feedItem)

    this.db.remote.push('EncryptedFeed').catch(e => log.error('remote push failed', e.message, e))
  }

  // eslint-disable-next-line require-await
  async read(id) {
    return this.Feed.findById(id)
  }

  // eslint-disable-next-line require-await
  async readByPaymentId(paymentId) {
    return this.Feed.table.where({ 'data.hashedCode': paymentId }).toArray()
  }

  async encrypt(feedItem) {
    const msg = new TextEncoder().encode(JSON.stringify(feedItem))
    const encrypted = await this.pkey.public.encrypt(msg).then(_ => Buffer.from(_).toString('base64'))
    return this.EncryptedFeed.save({ _id: feedItem._id, encrypted })
  }

  async decrypt(id) {
    const { encrypted } = await this.EncryptedFeed.findById(id)
    const decrypted = await this.pkey.decrypt(Uint8Array.from(Buffer.from(encrypted, 'base64')))
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

export default once(() => new TextileDB())
