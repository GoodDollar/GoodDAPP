// @flow

import Web3 from 'web3'
import { assign, random } from 'lodash'
import { retry } from '../utils/async'

const { providers } = Web3
const { HttpProvider } = providers
const connectionErrorRe = /(connection (error|timeout)|invalid json rpc)'/i

export class MultipleHttpProvider extends HttpProvider {
  constructor(endpoints, config) {
    const nEndpoints = endpoints.length // endpoints are Array<{ provider: string; options: any; }> list of url+config pairs
    const [{ provider, options }] = endpoints // init with first endpoint config
    const { strategy = 'next', attempts = nEndpoints } = config || {} // or 'random'

    super(provider, options)

    assign(this, {
      endpoints,
      strategy,
      attempts: Math.min(attempts, nEndpoints),
      activeEndpoint: 0,
    })
  }

  send(payload, callback) {
    const afterSend = (error, opts, defaultOpts) => {
      // if connection issue - switch to the next andpoint and retry
      if (connectionErrorRe.test(error.message)) {
        this._switchToNext()
        return defaultOpts
      }

      // stop retrying on any other error
      return { ...defaultOpts, retries: 0 }
    }

    // eslint-disable-next-line require-await
    retry(async () => this._sendRequest(payload), this.attempts - 1, 0, afterSend)
      .then(result => callback(null, result))
      .catch(callback)
  }

  /** @private */
  _switchToNext() {
    const { strategy, endpoints, activeEndpoint } = this
    const nEndpoints = endpoints.length
    let endpointIdx

    if (nEndpoints < 2) {
      return
    }

    switch (strategy) {
      case 'next': {
        endpointIdx = activeEndpoint + 1

        if (endpointIdx >= nEndpoints) {
          endpointIdx = 0
        }

        break
      }
      case 'random': {
        do {
          endpointIdx = random(0, nEndpoints - 1)
        } while (endpointIdx === activeEndpoint)

        break
      }
      default: {
        throw new Error(`Invalid strategy '${strategy}' specified, should be 'next' or 'random'.`)
      }
    }

    const { provider, options } = endpoints[endpointIdx]

    this.activeEndpoint = endpointIdx
    HttpProvider.call(this, provider, options)

    // calling ctor as fn with this context, to re-apply ALL settings
    // as ctor is defined as function, not as class this hack will work
    // see node_modules/web3-providers-http/src/index.js
  }

  /** @private */
  // eslint-disable-next-line require-await
  async _sendRequest(payload) {
    let resolve, reject
    const sendPromise = new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })

    super.send(payload, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })

    return sendPromise
  }
}

export const { WebsocketProvider } = providers
