// @flow
/* eslint-disable require-await */

// Import the Ceramic and Tile document clients
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { get, once } from 'lodash'

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

export const serializePagination = (pagination: any) => {
  let { items } = pagination
  items = items.map(serializeDocument)

  return {
    ...pagination,
    items,
  }
}

export const isPagination = object =>
  ['items', 'page', 'perPage', 'totalPages', 'totalItems'].every(prop => prop in object)

export class CeramicModel {
  static index = null

  static indexes = {}

  static get ceramic() {
    return getCeramicClient()
  }

  static async all(): Promise<TileDocument[]> {
    const { content } = await this.getIndex()

    return this._loadEntities(content.items)
  }

  static async paginate(page: number = 1, count: number = 10): Promise<SimplePaginatorContract<TileDocument>> {
    const index = await this.getIndex()
    const items = get(index, 'content.items', [])

    return this._paginateOver(items, page, count)
  }

  static async find(id: string): Promise<TileDocument> {
    return TileDocument.load(this.ceramic, id)
  }

  static async findBy(property: string, value: any): Promise<TileDocument[]> {
    const items = await this._readIndex(property, value)

    return this._loadEntities(items)
  }

  static async paginateBy(
    property: string,
    value: any,
    page: number = 1,
    count: number = 10,
  ): Promise<SimplePaginatorContract<TileDocument>> {
    const items = await this._readIndex(property, value)

    return this._paginateOver(items, page, count)
  }

  static async getIndex(name?: string = null): Promise<TileDocument> {
    const indexID = name ? this.indexes[name] : this.index

    if (!indexID) {
      throw new Error(name ? "Primary index isn't defied" : `No index defined for property '${name}'`)
    }

    return this.find(indexID)
  }

  /** @private */
  static async _readIndex(property: string, value: any): Promise<string[]> {
    if (!(property in this.indexes)) {
      throw new Error(`Cannot query documents using non-indexed property '${property}'`)
    }

    const index = await this.getIndex(property)
    const items = get(index, 'content.items', {})

    return items[String(value)] || []
  }

  /** @private */
  static async _loadEntities(ids: string[]): Promise<TileDocument[]> {
    return Promise.all(ids.map(async id => this.find(id)))
  }

  /** @private */
  static async _paginateOver(
    itemsIds: string[],
    page: number = 1,
    perPage: number = 10,
  ): Promise<SimplePaginatorContract<TileDocument>> {
    const totalItems = itemsIds.length
    const startFrom = perPage * (page - 1)
    const totalPages = Math.ceil(totalItems / perPage)
    const pageIds = itemsIds.slice(startFrom, startFrom + perPage)
    const items = await this._loadEntities(pageIds)

    return { items, page, perPage, totalPages, totalItems }
  }
}
