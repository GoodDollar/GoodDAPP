// @flow

import Web3 from 'web3'
import { assign, shuffle } from 'lodash'
import { fallback, makePromiseWrapper } from '../utils/async'
import logger from '../logger/js-logger'

const { providers } = Web3
const { HttpProvider } = providers
const log = logger.child({ from: 'MultipleHttpProvider' })
const connectionErrorRe = /connection (error|timeout)|invalid json rpc/i

export class MultipleHttpProvider extends HttpProvider {
  constructor(endpoints, config) {
    const [{ provider, options }] = endpoints // init with first endpoint config
    const { strategy = 'random' } = config || {} // or 'random'

    log.debug('Setting default endpoint', { provider, config })
    super(provider, options)

    log.debug('Initialized', { endpoints, strategy })
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
      log.trace('Picked up peer', { provider, options }, payload.id)

      // calling ctor as fn with this context, to re-apply ALL settings
      // as ctor is defined as function, not as class this hack will work
      // see node_modules/web3-providers-http/src/index.js
      HttpProvider.call(this, provider, options)

      log.trace('Sending request to peer', { payload })
      return this._sendRequest(payload)
    })

    const onSuccess = result => {
      log.trace('Success, got result', { result })
      callback(null, result)
    }

    const onFailed = error => {
      log.warn('Failed with last error', error.message, error, payload.id)
      callback(error, null)
    }

    // if not connection issue - stop fallback, throw error
    const onFallback = error => {
      const { message } = error

      // retry on network error or if rpc responded with error (error.error)
      const willFallback = error.error !== undefined || connectionErrorRe.test(message)

      log.warn('send: got error', message, error, { willFallback })
      return willFallback
    }

    log.trace('send: exec over peers', { peers, strategy, calls })

    fallback(calls, onFallback)
      .then(onSuccess)
      .catch(onFailed)
  }

  /**
   * Promisifies HttpProvider.send to be compatible with fallback() util
   * @private
   * */
  // eslint-disable-next-line require-await
  async _sendRequest(payload) {
    const { promise, callback: pcallback } = makePromiseWrapper()
    const checkRpcError = (error, response) => {
      //regular network error
      if (error) {
        return pcallback(error)
      }

      //rpc responded with error or no result
      if (response.error || !response.result) {
        return pcallback(response)
      }

      //response ok
      return pcallback(null, response)
    }
    super.send(payload, checkRpcError)
    return promise
  }
}

export const { WebsocketProvider } = providers
