import FileAPI from 'promisify-file-reader'
import { get, memoize } from 'lodash'
import axios from 'axios'

import Config from '../../config/config'

import { fallback } from '../utils/async'
import { withTemporaryFile } from '../utils/fs'
import { normalizeDataUrl } from '../utils/base64'

class IpfsStorage {
  constructor(httpFactory, config) {
    const { pinataApiKey, pinataSecret, pinataBaseUrl, ipfsGateways } = config

    this.client = httpFactory.create({
      withCredentials: true,
      maxContentLength: 'Infinity',
      maxBodyLength: 'Infinity',
      baseURL: pinataBaseUrl,
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecret,
      },
    })

    this.gateways = ipfsGateways
    this.client.get = url => httpFactory.get(url, { responseType: 'blob' })
  }

  async store(dataUrl) {
    const { client } = this
    const form = new FormData()

    // eslint-disable-next-line require-await
    const { data } = await withTemporaryFile(dataUrl, async file => {
      form.append('file', file)
      form.append('pinataOptions', '{"cidVersion": 1}')

      return client.post('pinning/pinFileToIPFS', form)
    })

    return get(data, 'IpfsHash')
  }

  async load(cid, options = null) {
    const { skipCache = false, withFormat = false } = options || {}
    const clear = () => this._clearCache(cid)

    if (true === skipCache) {
      clear()
    }

    try {
      const cidContent = await this._load(cid)
      const { dataUrl } = cidContent

      return withFormat ? cidContent : dataUrl
    } catch (exception) {
      clear()
      throw exception
    }
  }

  _load = memoize(async cid => {
    const { gateways, client } = this

    const { data, headers } = await fallback(
      // eslint-disable-next-line require-await
      gateways.map(urlFactory => async () => client.get(urlFactory({ cid }))),
    )

    const mime = get(headers, 'content-type')
    const binary = mime.startsWith('image/')
    const format = binary ? 'DataURL' : 'Text'
    const rawData = await FileAPI[`readAs${format}`](data)
    const dataUrl = binary ? normalizeDataUrl(rawData, mime) : rawData

    return { binary, dataUrl }
  })

  _clearCache(cid) {
    const { cache } = this._load

    if (!cache.has(cid)) {
      return
    }

    cache.delete(cid)
  }
}

export default new IpfsStorage(axios, Config)
