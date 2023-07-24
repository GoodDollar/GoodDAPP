import { Linking } from 'react-native'
import { assign, over } from 'lodash'
import logger from '../logger/js-logger'
import { createUrlObject } from './uri'

const log = logger.child({ from: 'deeplinking.native' })

class DeepLinkingNative {
  _isAppOpenLink = false

  params = {
    paymentCode: '',
    code: '',
    reason: '',
    event: '',
  }

  callbackParams = {}

  navigationCallbacks = []

  pathname = ''

  constructor() {
    this.initialize()
  }

  initialize = async () => {
    Linking.addEventListener('url', this.processLink)
    const universalLink = await Linking.getInitialURL()
    log.info('initialized subscribe', { universalLink })

    if (universalLink) {
      this._isAppOpenLink = true
      this.processLink({ url: universalLink })
    }
  }

  subscribe = navigationCallback => {
    // starting subscription only when first valid callback is passed
    // and we haven't active subscription yet
    // if pass this check - we'll have more that one callback invoke per each emit
    // and will be unable to unsubscribe if will subscribe more that once
    if (navigationCallback) {
      this.navigationCallbacks.push(navigationCallback)

      log.info('subscribing activating calback for app open if first run', this._isAppOpenLink)
      if (this._isAppOpenLink === true) {
        // if we had a link previously then call callback
        this._isAppOpenLink = false
        navigationCallback(this.callbackParams)
      }
    }
  }

  unsubscribe = () => {
    this.navigationCallbacks = []
  }

  processLink = ({ url: link }) => {
    log.debug('universal link listener', { link })

    // no link do nothing
    if (!link) {
      return
    }

    this.params = {}

    const decodedLink = decodeURI(link)
    const { params: queryParams } = createUrlObject(decodedLink)
    const { pathname } = createUrlObject(link)

    assign(this, { link: decodedLink })
    assign(this, { pathname })
    assign(this.params, queryParams)
    assign(this.callbackParams, { link: decodedLink, path: pathname, queryParams })

    log.debug('calling deeplink callbacks with:', {
      originalLink: link,
      path: this.pathname,
      queryParams,
    })

    over(this.navigationCallbacks)(this.callbackParams)
  }
}

export default new DeepLinkingNative()
