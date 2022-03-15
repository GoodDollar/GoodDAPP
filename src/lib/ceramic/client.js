// @flow
/* eslint-disable require-await */

// Import the Ceramic and Tile document clients
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { once } from 'lodash'

import Config from '../../config/config'

export type SimplePaginatorContract<T> = {
  items: T[],
  page: number,
  perPage: number,
  totalPages: number,
  totalItems: number,
}

export const getCeramicClient = once(() => new CeramicClient(Config.ceramicNodeURL))

export const serializeDocument = (document: any) => {
  const { id, content } = document

  return {
    ...content,
    id: String(id),
  }
}

export const serializeCollection = (documents: any[]) => {
  return documents.map(serializeDocument)
}

export class CeramicModel {
  static index = null

  static liveIndex = null

  static get ceramic() {
    return getCeramicClient()
  }

  static async all(): Promise<TileDocument[]> {
    const { content } = await this._getIndex()

    return this._loadEntities(content.items)
  }

  static async find(id: string): Promise<TileDocument> {
    return TileDocument.load(this.ceramic, id)
  }

  static async getLiveIndex(): Promise<TileDocument> {
    return this._getIndex(true)
  }

  /** @private */
  static async _getIndex(forLiveUpdates = false): Promise<TileDocument> {
    const indexID = forLiveUpdates ? this.liveIndex : this.index

    if (!indexID) {
      throw new Error(`${forLiveUpdates ? 'Primary' : 'Live'} index isn't defined`)
    }

    return this.find(indexID)
  }

  /** @private */
  static async _loadEntities(ids: string[]): Promise<TileDocument[]> {
    return Promise.all(ids.map(async id => this.find(id)))
  }
}
