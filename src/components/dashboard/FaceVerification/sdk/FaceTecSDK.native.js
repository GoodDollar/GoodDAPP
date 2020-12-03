// @flow
import { constant, noop, over } from 'lodash'

// import FaceTec, { FaceTecUxEvent } from 'react-native-zoom'

import api from '../../../../lib/API/api'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

// export { FaceTecSDKStatus, FaceTecSessionStatus } from 'react-native-zoom'
// API stubs
export const FaceTecUxEvent = {}
export const FaceTecSDKStatus = {}
export const FaceTecSessionStatus = {}
const noopAsync = async () => true // eslint-disable-line require-await

const FaceTec = {
  sdk: {
    addListener: constant(noop),
    initialize: noopAsync,
    enroll: noopAsync,
  },
}

// sdk class
export const FaceTecSDK = new class {
  constructor(sdk, logger) {
    this.sdk = sdk
    this.logger = logger
  }

  async initialize(licenseKey, licenseText = null, encryptionKey = null, preload = true) {
    const { sdk, logger } = this
    let license = null

    if (licenseText) {
      // exclude web-only 'domains' option from license text
      license = licenseText
        .split('\n')
        .filter(line => !line.includes('domains'))
        .join('\n')
    }

    try {
      // TODO: update native implementation to use GoodServer for issue session token
      const isInitialized = await sdk.initialize(licenseKey, license, encryptionKey, preload, Config.serverUrl)

      return isInitialized
    } catch (exception) {
      const { message } = exception

      logger.warn(`FaceTec initialization failed`, message, exception)
      throw exception
    }
  }

  async faceVerification(enrollmentIdentifier, sessionOptions = null) {
    const { sdk, logger } = this
    // eslint-disable-next-line no-undef
    const { UI_READY, CAPTURE_DONE, FV_RETRY } = ZoomUxEvent
    const { onUIReady = noop, onCaptureDone = noop, onRetry = noop } = sessionOptions || {}

    // addListener calls returns unsubscibe functions we're storing in this array
    const subscriptions = [
      // subscribing to the native events
      sdk.addListener(UI_READY, onUIReady),
      sdk.addListener(CAPTURE_DONE, onCaptureDone),
      sdk.addListener(FV_RETRY, onRetry),
    ]

    try {
      // we're passing current JWT to the native code allowing it to call GoodServer for verification
      // unfortunately we couldn't pass callback which could return some data back to the native code
      // so it's only way to integrate Zoom on native - to reimplement all logic about calling server
      const verificationStatus = await sdk.enroll(enrollmentIdentifier, api.jwt)

      return verificationStatus
    } catch (exception) {
      const { message } = exception

      logger.warn(`Face verification failed`, message, exception)
      throw exception
    } finally {
      // don't forgetting to unsubscribe
      // just going over unsubscribe functions stored in subscriptions array and calling them
      over(subscriptions)()
    }
  }
}(FaceTec.sdk, logger.child({ from: 'FaceTecSDK.native' })) // eslint-disable-line
