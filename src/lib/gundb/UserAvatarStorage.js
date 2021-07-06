import { assign, memoize } from 'lodash'

import Config from '../../config/config'
import { fallback } from '../utils/async'
import { asFile, asImageRecord } from '../utils/image'
import { File, metadataUrl, NFTStorage, parseIpfsUrl } from '../utils/ipfs'

class UserAvatarStorage {
  constructor(apiKey, peers, sizes) {
    assign(this, { peers })
    this.client = new NFTStorage({ token: apiKey })
  }

  async loadAvatars(cid, skipCache = false) {
    const clear = () => this._clearCache(cid)

    if (true === skipCache) {
      clear()
    }

    try {
      return await this._loadAvatars(cid)
    } catch (exception) {
      clear()
      throw exception
    }
  }

  async storeAvatars(profile) {
    const { avatar, smallAvatar, fullName } = profile || {}
    const name = fullName || 'Unknown'

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
      description: name, // so we're supplying full name here
      image: asFile(smallAvatar || avatar), // small (preview) avatar, fallback to the full avatar if empty
      properties: {
        avatar: asFile(avatar), // full avatar
      },
    }

    // upload asset definition, read CID from response
    const { ipnft } = await this.client.store(asset)

    return ipnft
  }

  // eslint-disable-next-line require-await
  async deleteAvatars(cid) {
    const { client } = this

    return client.delete(cid)
  }

  _loadAvatars = memoize(async cid => {
    // loading metadata.json for the CID specified
    const { name, image, properties } = await this._loadMetadata(cid)

    // 'image' and 'properties.avatar' will be ipfs urls of the avatar images
    // the rest of the 'properties' object is the profile object
    // interface ProfileMetadata {
    //   name: string; // asset's name
    //   description: string; // asset's description
    //   image: string; // small avatar's url
    //   properties: {
    //     avatar: string; // avatar's url
    //   }
    // }
    const profile = { fullName: name }
    const { avatar } = properties

    if (avatar) {
      // loading profile images from the corresponding ipfs urls
      // metadata.image => smallAvatar
      // metadata.properties.avatar => avatar
      const mapping = [[avatar, 'avatar'], [image, 'smallAvatar']]

      // doing requests in parallel
      await Promise.all(
        mapping.map(([ipfsUrl, field]) =>
          this._loadFile(ipfsUrl)

            // once loaded - updating corresponding profile field
            .then(imageRecord => (profile[field] = imageRecord)),
        ),
      )
    }

    return profile
  })

  _clearCache(cid) {
    const { cache } = this._loadAvatars

    if (!cache.has(cid)) {
      return
    }

    cache.delete(cid)
  }

  // eslint-disable-next-line require-await
  async _loadMetadata(cid) {
    const ipfsUrl = metadataUrl(cid)

    return this._lookupPeers(ipfsUrl, response => response.json())
  }

  // eslint-disable-next-line require-await
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

    // using async 'fallback' helper over the 'peers' array
    return fallback(
      peers.map(peer => async () => {
        // each peer is pre compiled template function
        // (see src/config/config./js)
        // to get url we need to call it with parsed url
        // ({ cid, path } object) as argument
        const url = peer(parsedUrl)
        const response = await fetch(url)

        // once fetched, calling the callback with parsed ipfs url
        // and the final http url we requested
        return loadCallback(response, { ...parsedUrl, url })
      }),
    )
  }
}

// IIFE factory instantiating UserAvatarStorage from the app's config
export default (config => {
  const { nftStorageKey, nftPeers } = config

  return new UserAvatarStorage(nftStorageKey, nftPeers)
})(Config)
