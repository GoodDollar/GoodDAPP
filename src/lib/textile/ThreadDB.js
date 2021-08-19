// @flow
import { Collection, Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'

import logger from '../logger/pino-logger'
import { FeedItemIndexes, FeedItemSchema } from './feedSchema'

const log = logger.child({ from: 'RealmDB' })

class ThreadDB {
  db: Database

  static databases = {}

  static async open(privateKey: TextileCrypto.PrivateKey) {
    const databaseId = privateKey.public.toString()
    const { databases } = ThreadDB
    let database = databases[databaseId]

    if (!database) {
      database = new ThreadDB(databaseId)

      await databases.init()
      databases[databaseId] = database
    }

    return database
  }

  get Feed(): Collection {
    return this.db.collection('Feed')
  }

  get FeedTable() {
    return this.Feed.table
  }

  constructor(databaseId) {
    this.db = new Database(`feed_${databaseId}`, {
      name: 'Feed',
      schema: FeedItemSchema,
      indexes: FeedItemIndexes,
    })
  }

  async init() {
    try {
      await this.db.open(1) // Versioned db on open
    } catch (e) {
      log.error('failed initializing', e.message, e)
      throw e
    }
  }
}

export default ThreadDB
