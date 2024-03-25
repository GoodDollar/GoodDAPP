import { get, sortBy } from 'lodash'
import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'
import { isMobileNative } from '../utils/platform'
import { fallback } from '../utils/async'
import { withTemporaryFile } from '../utils/fs'
import { normalizeDataUrl } from '../utils/base64'
import * as FileAPI from '../utils/filereader'
import { toV1 } from './utils'

class IpfsStorage {
  constructor(config, logger) {
    const { ipfsGateways, ipfsUploadGateway } = config

    this.ipfsUploadGateway = ipfsUploadGateway
    this.logger = logger
    this.gateways = ipfsGateways.map((urlFactory, index) => ({ urlFactory, index, failed: 0 }))
  }

  _post(formData) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    }
    if (isMobileNative) {
      headers.origin = 'wallet.gooddollar.org'
    }

    return fetch(this.ipfsUploadGateway, {
      method: 'POST',
      body: formData,
      headers,
    }).then(_ => _.json())
  }

  _get(url) {
    const headers = {}
    if (isMobileNative) {
      headers.origin = 'wallet.gooddollar.org'
    }
    return fetch(url).then(_ => _.blob())
  }

  async store(dataUrl) {
    const form = new FormData()

    // eslint-disable-next-line require-await
    const { cid } = await withTemporaryFile(dataUrl, async file => {
      form.append('file', file)
      return this._post(form)
    })

    return toV1(cid)
  }

  async load(cid, withMetadata = false) {
    const { data, headers } = await this._loopkupGateways(cid)
    const mime = get(headers, 'content-type')
    const binary = !mime.startsWith('text/')
    const format = binary ? 'DataURL' : 'Text'
    // eslint-disable-next-line import/namespace
    const rawData = await FileAPI[`readAs${format}`](data)
    const dataUrl = binary ? normalizeDataUrl(rawData, mime) : rawData

    if (withMetadata) {
      return { binary, dataUrl }
    }

    return dataUrl
  }

  async _loopkupGateways(cid) {
    const { logger, gateways, _requestGateway } = this

    // try gateways and update failed counters
    try {
      const v1 = toV1(cid)

      logger.debug('lookup cid:', { cid, v1 })
      // eslint-disable-next-line require-await
      return await fallback(gateways.map(gateway => async () => _requestGateway(cid, v1, gateway)))
    } finally {
      // doesn't changes gateway order if it have failed count < 3
      // the gateways failed more times will be moved to the end
      const failingAttemptsGreaterThree = ({ failed }) => (failed < 3 ? 0 : failed)

      // re order gateways. non-failing will keep priorities set in config
      this.gateways = sortBy(gateways, failingAttemptsGreaterThree, 'index')
    }
  }

  _requestGateway = async (cid, v1, gateway) => {
    const { urlFactory } = gateway
    const { logger } = this
    const url = urlFactory({ cid: v1 })

    try {
      // try gateway
      const response = await this._get(url)

      // reset failing attempts counter on success
      gateway.failed = 0
      logger.debug('try IPFS url: success', { url, cid })

      return response
    } catch (exception) {
      logger.debug('try IPFS url: FAIL', { url, cid })

      // increase it on error
      gateway.failed += 1
      throw exception
    }
  }
}

export default new IpfsStorage(Config, logger.child({ from: 'IpfsStorage' }))
