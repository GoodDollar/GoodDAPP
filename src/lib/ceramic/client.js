// @flow
/* eslint-disable require-await */

// Import the Ceramic and Tile document clients
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { assign, isString, once } from 'lodash'

import Config from '../../config/config'
import { batch } from '../../lib/utils/async'

const { ceramicNodeURL, ceramicBatchSize, ceramicSyncTimeout } = Config
const syncOptions = { syncTimeoutSeconds: ceramicSyncTimeout / 1000 }
const hexadecimalRe = /^[0-9a-f]+$/i

export const isValidHistoryId = id => isString(id) && id.length === 40 && hexadecimalRe.test(id)

export const getCeramicClient = once(() => new CeramicClient(ceramicNodeURL))

export const serializeDocument = (document: any) => {
  const { id, content } = document
  const tags = content?.tags || []

  if (tags.some(tag => tag.slug === 'publishDapp')) {
    return
  }

  return {
    ...content,
    id: String(id),
  }
}

export const serializeCollection = (documents: any[]) => {
  return documents.map(serializeDocument).filter(document => document !== undefined)
}

export class CeramicModel {
  static index = null

  static liveIndex = null

  static get ceramic() {
    return getCeramicClient()
  }

  static async all(): Promise<TileDocument[]> {
    const {
      content: { items = [] },
    } = await this._getIndex()

    return this._loadEntities(items)
  }

  static async find(id: any): Promise<TileDocument> {
    const { content } = await this._getIndex()
    const documentId = String(id)

    if (!content.items.includes(documentId)) {
      const exception = new Error(`Ceramic document with '${documentId}' ID doesn't exists or have been removed`)

      assign(exception, {
        documentId,
        name: 'DOCUMENT_NOT_FOUND',
      })

      throw exception
    }

    return this.loadDocument(id)
  }

  static async getLiveIndex(): Promise<TileDocument> {
    return this._getIndex(true)
  }

  static async loadDocument(id: any): Promise<TileDocument> {
    return TileDocument.load(this.ceramic, id, syncOptions)
  }

  /** @private */
  static async _getIndex(forLiveUpdates = false): Promise<TileDocument> {
    const indexID = forLiveUpdates ? this.liveIndex : this.index

    if (!indexID) {
      throw new Error(`${forLiveUpdates ? 'Primary' : 'Live'} index isn't defined`)
    }

    return this.loadDocument(indexID)
  }

  /** @private */
  static async _loadEntities(ids: string[]): Promise<TileDocument[]> {
    return batch(ids, ceramicBatchSize, async id => this.loadDocument(id))
  }
}
