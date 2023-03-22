// @flow

import Web3 from 'web3'
import { assign, shuffle } from 'lodash'
import { fallback } from '../utils/async'

const { providers } = Web3
const { HttpProvider } = providers
const connectionErrorRe = /(connection (error|timeout)|invalid json rpc)'/i

export class MultipleHttpProvider extends HttpProvider {
  constructor(endpoints, config) {
    const [{ provider, options }] = endpoints // init with first endpoint config
    const { strategy = 'next' } = config || {} // or 'random'

    super(provider, options)

    assign(this, {
      endpoints,
      strategy,
    })
  }

  send(payload, callback) {
    const { endpoints, strategy } = this

    // shuffle peers if random strategy chosen
    const peers = strategy === 'random' ? shuffle(endpoints) : endpoints

    // eslint-disable-next-line require-await
    const calls = peers.map(({ provider, options }) => async () => {
      // calling ctor as fn with this context, to re-apply ALL settings
      // as ctor is defined as function, not as class this hack will work
      // see node_modules/web3-providers-http/src/index.js
      HttpProvider.call(this, provider, options)

      return this._sendRequest(callback)
    })

    // if not connection issue - stop fallback, throw error
    const onFallback = error => connectionErrorRe.test(error.message)

    fallback(calls, onFallback)
      .then(result => callback(null, result))
      .catch(callback)
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
