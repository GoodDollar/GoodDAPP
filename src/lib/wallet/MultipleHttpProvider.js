// @flow

import Web3 from 'web3'
import { assign, has, shuffle } from 'lodash'
import { fallback, makePromiseWrapper, retry } from '../utils/async'
import logger, { isConnectionError } from '../logger/js-logger'
import { isDuplicateTxError } from './utils'

const { providers } = Web3
const { HttpProvider } = providers
const log = logger.child({ from: 'MultipleHttpProvider' })

const isTxError = message => isDuplicateTxError(message) || message?.search(/reverted|gas/i)

export class MultipleHttpProvider extends HttpProvider {
  constructor(endpoints, config) {
    const [{ provider, options }] = endpoints // init with first endpoint config
    const { strategy = 'random', retries = 1 } = config || {} // or 'random'

    log.debug('Setting default endpoint', { provider, config })
    super(provider, options)

    log.debug('Initialized', { endpoints, strategy })

    assign(this, {
      loggedProviders: new Map(),
      endpoints,
      strategy,
      retries,
    })
  }

  send(payload, callback) {
    const { endpoints, strategy, retries, loggedProviders } = this

    // shuffle peers if random strategy chosen
    const peers = strategy === 'random' ? shuffle(endpoints) : endpoints

    // eslint-disable-next-line require-await
    const calls = peers.map(({ provider, options }) => async () => {
      log.trace('Picked up peer', { provider, options }, payload.id)

      // calling ctor as fn with this context, to re-apply ALL settings
      // as ctor is defined as function, not as class this hack will work
      // see node_modules/web3-providers-http/src/index.js
      HttpProvider.call(this, provider, options)

      try {
        log.trace('Sending request to peer', { payload })
        return await this._sendRequest(payload)
      } catch (exception) {
        if (isConnectionError(exception) && !loggedProviders.has(provider)) {
          loggedProviders.set(provider, true)

          // log.exception bypass network error filtering
          log.exception('HTTP Provider failed to send:', exception.message, exception, { provider })
        } else {
          log.warn('HTTP Provider failed to send:', exception.message, exception, { provider })
        }

        throw exception
      }
    })

    const onSuccess = result => {
      log.trace('Success, got result', { result })
      callback(null, result)
    }

    const onFailed = error => {
      if (!isTxError(error.message) && !isConnectionError(error)) {
        log.error('Failed with last unknown error', error.message, error)
      } else {
        log.warn('Failed with last error', error.message, error, payload.id)
      }

      callback(error, null)
    }

    // if not connection issue - stop fallback, throw error
    const onFallback = error => {
      const { message, code } = error

      // retry if not tx issue and network error or if rpc responded with error (error.error)
      const willFallback = !isTxError(message) && !!(code || error.error || !message || isConnectionError(message))

      if (!willFallback) {
        log.warn('send: got error', { message, error, willFallback })
      }

      return willFallback
    }

    log.trace('send: exec over peers', { peers, strategy, calls })

    retry(() => fallback(calls, onFallback), retries, 0)
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
      if (response.error || has(response, 'result') === false) {
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
