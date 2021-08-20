// @flow
import { Collection, Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'

import { assign } from 'lodash'
import logger from '../logger/pino-logger'
import { FeedItemIndexes, FeedItemSchema } from './feedSchema'
import { AssetSchema } from './assetSchema'

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

  get Ipfs(): Collection {
    return this.frontendDB.collection('Ipfs')
  }

  get IpfsTable() {
    return this.Ipfs.table
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
        schema: AssetSchema,
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
