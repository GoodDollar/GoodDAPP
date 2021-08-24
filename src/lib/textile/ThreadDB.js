// @flow
import { Collection, Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'

import { assign } from 'lodash'
import logger from '../logger/pino-logger'
import { FeedItemIndexes, FeedItemSchema } from './feedSchema'
import { AssetsSchema } from './assetsSchema'

const log = logger.child({ from: 'RealmDB' })

export class ThreadDB {
  frontendDB: Database

  privateKey: TextileCrypto.PrivateKey

  databaseID: string

  get Feed(): Collection {
    return this.frontendDB.collection('Feed')
  }

  get FeedTable() {
    return this.Feed.table
  }

  get Assets(): Collection {
    return this.frontendDB.collection('Assets')
  }

  constructor(privateKey: TextileCrypto.PrivateKey) {
    const databaseID = privateKey.public.toString()

    const frontendDB = new Database(
      `feed_${databaseID}`,
      {
        name: 'Feed',
        schema: FeedItemSchema,
        indexes: FeedItemIndexes,
      },
      {
        name: 'Assets',
        schema: AssetsSchema,
      },
    )

    assign(this, { frontendDB, privateKey, databaseID })
  }

  async init() {
    try {
      await this.frontendDB.open(2) // Versioned db on open
    } catch (e) {
      log.error('failed initializing', e.message, e)
      throw e
    }
  }
}
