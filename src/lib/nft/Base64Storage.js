import { memoize } from 'lodash'

import Config from '../../config/config'
import { Blob, NFTStorage } from './client'

export class Base64Storage {
  constructor(apiKey) {
    this.client = new NFTStorage({ token: apiKey })
  }

  // eslint-disable-next-line require-await
  async store(base64) {
    const { client } = this
    const blob = new Blob([base64])

    return client.storeBlob(blob)
  }

  async load(cid, skipCache = false) {
    const clear = () => this._clearCache(cid)

    if (true === skipCache) {
      clear()
    }

    try {
      return await this._load(cid)
    } catch (exception) {
      clear()
      throw exception
    }
  }

  // eslint-disable-next-line require-await
  async delete(cid) {
    const { client } = this

    return client.delete(cid)
  }

  _load = memoize(async cid => {
    const url = `https://${cid}.ipfs.dweb.link`
    const response = await fetch(url)

    return response.text()
  })

  _clearCache(cid) {
    const { cache } = this._load

    if (!cache.has(cid)) {
      return
    }

    cache.delete(cid)
  }
}

export default new Base64Storage(Config.nftStorageKey)
