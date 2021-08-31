// @flow
import { Collection, Database } from '@textile/threaddb'
import * as TextileCrypto from '@textile/crypto'

import { assign } from 'lodash'
import logger from '../logger/pino-logger'
import { FeedItemIndexes, FeedItemSchema } from './feedSchema'
import { AssetsSchema } from './assetsSchema'
import { ProfilesSchema } from './profilesSchema'

const log = logger.child({ from: 'RealmDB' })

export class ThreadDB {
  db: Database

  privateKey: TextileCrypto.PrivateKey

  databaseID: string

  get Feed(): Collection {
    return this.db.collection('Feed')
  }

  get Assets(): Collection {
    return this.db.collection('Assets')
  }

  constructor(privateKey: TextileCrypto.PrivateKey) {
    const databaseID = privateKey.public.toString()

    const db = new Database(
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
      {
        name: 'Profiles',
        schema: ProfilesSchema,
      },
    )

    assign(this, { db, privateKey, databaseID })
  }

  async init() {
    try {
      await this.db.open(3) // Versioned db on open
    } catch (e) {
      log.error('failed initializing', e.message, e)
      throw e
    }
  }
}
