/* eslint require-await: "off" */
import { assign, isUndefined } from 'lodash'

import Config from '../../config/config'

import { fallback } from '../utils/async'
import { asFile, asImageRecord, DEFAULT_AVATAR_FILENAME } from '../utils/image'
import { blobUrl, File, metadataUrl, NFTStorage, parseIpfsUrl } from '../utils/ipfs'

class UserAvatarStorage {
  cache = new Map()

  constructor(apiKey, peers, sizes) {
    assign(this, { peers })
    this.client = new NFTStorage({ token: apiKey })
  }

  async loadAvatars(cid, size = 'small') {
    let { metadata, image } = this.cache.get(cid) || {}

    if (isUndefined(metadata)) {
      metadata = await this._loadMetadata(cid)
    }

    const isRawBase64 = false === metadata
    const withCache = isRawBase64 || 'small' === size

    if (!withCache || !image) {
      // eslint-disable-next-line
      image = await (isRawBase64
        ? this._loadBase64(cid)
        : this._loadAvatar(metadata, size)
      )
    }

    const cacheData = { metadata }

    if (withCache) {
      assign(cacheData, { image })
    }

    this._updateCache(cid, cacheData)
    return image
  }

  async storeAvatars(avatar, smallAvatar) {
    const { filename: name } = avatar || {}
    const { filename: description = name } = smallAvatar || {}

    if (!avatar) {
      return
    }

    // preparing asset definition
    // interface AssetDefinition
    //   name: string; // asset's name & description,
    //   description: string;
    //   image: File; // small avatar as File class instance
    //   properties: {
    //     avatar: File; // avatar as File class instance
    //   }
    // }
    const asset = {
      name, // aren't used for storage, but are mandatory
      description, // so we're supplying full name here
      image: asFile(smallAvatar || avatar), // small (preview) avatar, fallback to the full avatar if empty
      properties: {
        avatar: asFile(avatar), // full avatar
      },
    }

    // upload asset definition, read CID from response
    const { ipnft } = await this.client.store(asset)

    return ipnft
  }

  async deleteAvatars(cid) {
    const { client, cache } = this

    await client.delete(cid)
    cache.delete(cid)
  }

  _updateCache(cid, data) {
    const { cache } = this
    let currentData = {}

    if (cache.has(cid)) {
      currentData = cache.get(cid)
    }

    cache.set(cid, { ...currentData, ...data })
  }

  async _loadAvatar(metadata, size = 'small') {
    // parsing metadata.json for the CID specified
    const { image, properties } = metadata

    // 'image' and 'properties.avatar' will be ipfs urls of the avatar images
    const { avatar } = properties
    let ipfsUrl = avatar

    if (size === 'small' && image) {
      ipfsUrl = image
    }

    return this._loadFile(ipfsUrl)
  }

  async _loadMetadata(cid) {
    const ipfsUrl = metadataUrl(cid)

    try {
      return await this._lookupPeers(ipfsUrl, response => response.json())
    } catch (exception) {
      const { status } = exception.response || {}

      if (status === 404) {
        return false
      }

      throw exception
    }
  }

  async _loadBase64(cid) {
    const ipfsUrl = blobUrl(cid)
    const base64 = await this._lookupPeers(ipfsUrl, response => response.text())

    return asImageRecord(base64, DEFAULT_AVATAR_FILENAME)
  }

  async _loadFile(ipfsUrl) {
    return this._lookupPeers(ipfsUrl, async (response, { path }) => {
      const { headers } = response

      // once loaded, read response as BLOB
      const blob = await response.blob()

      // read mime type from HTTP headers
      const type = headers.get('content-type')

      // get filename from the IPFS path,
      // create File instance from Blob,
      // convert to the image record
      return asImageRecord(new File([blob], path, { type }))
    })
  }

  // custom ipfs gateways request wrapper
  // uses fallback strategy. if some gw failed, tries the
  // next one until success or end of the peers list
  // eslint-disable-next-line require-await
  async _lookupPeers(ipfsUrl, loadCallback) {
    const { peers } = this

    // parsing IPFS url to the CID + path
    const parsedUrl = parseIpfsUrl(ipfsUrl)
    let url

    // using async 'fallback' helper over the 'peers' array
    const response = await fallback(
      peers.map(peer => async () => {
        // each peer is pre compiled template function
        // (see src/config/config./js)
        // to get url we need to call it with parsed url
        // ({ cid, path } object) as argument
        url = peer(parsedUrl)

        return fetch(url)
      }),
    )

    const { ok, status } = response
    let errorMessage

    if (!ok || status >= 400) {
      try {
        errorMessage = await response.text()
      } catch {
        errorMessage = 'Unknown server error'
      }

      const exception = new Error(errorMessage)

      exception.response = response
      throw exception
    }

    // once fetched, calling the callback with parsed ipfs url
    // and the final http url we requested
    return loadCallback(response, { ...parsedUrl, url })
  }
}

// IIFE factory instantiating UserAvatarStorage from the app's config
export default (config => {
  const { nftStorageKey, nftPeers } = config

  return new UserAvatarStorage(nftStorageKey, nftPeers)
})(Config)
