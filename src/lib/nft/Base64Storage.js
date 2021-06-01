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

  async load(cid) {
    const { _load } = this

    try {
      return await _load(cid)
    } catch (exception) {
      _load.cache.delete(cid)
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
}

export default new Base64Storage(Config.nftStorageKey)
