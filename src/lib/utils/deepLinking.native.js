import branch from 'react-native-branch'
import { assign, camelCase, mapKeys, over } from 'lodash'
import logger from '../logger/js-logger'
import { extractQueryParams } from '../share'
import extractPathname from './extractPathname'

const log = logger.get('deeplinking.native')

class DeepLinkingNative {
  constructor() {
    log.info('initial subscribe')
    this.subscribe()
  }

  _unsubscribe = null

  _lastClick = null

  _isFirstRun = true

  params = {
    paymentCode: '',
    code: '',
    reason: '',
    event: '',
  }

  callbackParams = {}

  navigationCallbacks = []

  pathname = ''

  subscribe = navigationCallback => {
    // starting subscription only when first valid callback is passed
    // and we haven't active subscription yet
    // if pass this check - we'll have more that one callback invoke per each emit
    // and will be unable to unsubscribe if will subscribe more that once
    if (navigationCallback) {
      this.navigationCallbacks.push(navigationCallback)

      log.info('subscribing activating callback', this._isFirstRun)
      if (this._isFirstRun === false) {
        //if we had a link previously then call callback
        navigationCallback(this.callbackParams)
      }
    }

    if (!this._unsubscribe) {
      // storing unsubscribe fn inside instance var
      this._unsubscribe = branch.subscribe(this._listener)
    }
  }

  unsubscribe = () => {
    // if we have active subscription
    if (this._unsubscribe) {
      // then calling unsubscribe fn
      this._unsubscribe()

      // cleaning up unsubscribe fn link
      this._unsubscribe = null

      // and cleaning callback previously added
      // if we don't perform this, they will be called
      // once we'll .subscribe() again
      this.navigationCallbacks.length = 0
    }
  }

  _listener = ({ error, params, uri }) => {
    if (error) {
      log.error('Error from Branch: ' + error)
      return
    }
    const ccParams = mapKeys(params, (_, name) => camelCase(name))

    const { clickedBranchLink, clickTimestamp, nonBranchLink, referringLink, url } = ccParams

    log.debug({ error, params, uri, ccParams, referringLink, nonBranchLink, clickedBranchLink })

    const link = uri || referringLink || url || nonBranchLink

    //no link do nothing
    if (!link) {
      return
    }

    this.params = {}
    this._isFirstRun = false
    this._lastClick = clickTimestamp
    let queryParams = params

    const decodedLink = decodeURI(link)
    assign(queryParams, extractQueryParams(decodedLink))
    this.pathname = extractPathname(link)

    assign(this.params, queryParams)
    assign(this.callbackParams, { originalLink: link, path: this.pathname, queryParams, branch: ccParams })

    log.debug('calling deeplink callbacks with:', {
      originalLink: link,
      path: this.pathname,
      queryParams,
      branch: ccParams,
    })

    over(this.navigationCallbacks)(this.callbackParams)
  }
}

export default new DeepLinkingNative()
