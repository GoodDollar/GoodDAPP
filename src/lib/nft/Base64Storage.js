import { memoize } from 'lodash'

import { Blob, NFTStorage } from 'nft.storage/src/lib'
import Config from '../../config/config'
import { fallback } from '../utils/async'

const { nftStorageKey, nftPeers } = Config

class Base64Storage {
  constructor(apiKey, peers) {
    this.client = new NFTStorage({ token: apiKey })
    this.peers = peers
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

  // eslint-disable-next-line require-await
  _load = memoize(async cid => {
    const { peers } = this

    return fallback(
      peers.map(peer => async () => {
        const url = peer.replace('{cid}', cid)
        const response = await fetch(url)

        return response.text()
      }),
    )
  })

  _clearCache(cid) {
    const { cache } = this._load

    if (!cache.has(cid)) {
      return
    }

    cache.delete(cid)
  }
}

export default new Base64Storage(nftStorageKey, nftPeers)
