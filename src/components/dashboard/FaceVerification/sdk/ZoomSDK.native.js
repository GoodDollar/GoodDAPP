// @flow
import { noop, over } from 'lodash'
import Zoom, { ZoomUxEvent } from 'react-native-zoom' // eslint-disable-line

import api from '../../../../lib/API/api'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

// eslint-disable-next-line
export { ZoomSDKStatus, ZoomSessionStatus } from 'react-native-zoom'

// sdk class
export const ZoomSDK = new class {
  constructor(sdk, logger) {
    this.sdk = sdk
    this.logger = logger
  }

  // eslint-disable-next-line require-await
  async preload() {
    const { sdk, logger } = this

    try {
      await sdk.preload()
    } catch (exception) {
      const { message } = exception

      logger.warn(`Zoom preloading failed`, message, exception)
      throw exception
    }
  }

  async initialize(licenseKey, preload) {
    const { sdk, logger } = this

    try {
      const isInitialized = await sdk.initialize(licenseKey, preload, Config.serverUrl, Config.zoomServerUrl)

      return isInitialized
    } catch (exception) {
      const { message } = exception

      logger.warn(`Zoom initialization failed`, message, exception)
      throw exception
    }
  }

  async faceVerification(enrollmentIdentifier, onUIReady = noop, onCaptureDone = noop, onRetry = noop) {
    const { sdk, logger } = this
    const { UI_READY, CAPTURE_DONE, FV_RETRY } = ZoomUxEvent

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

  // eslint-disable-next-line require-await
  async unload() {
    const { sdk, logger } = this

    try {
      await sdk.unload()
    } catch (exception) {
      const { message } = exception

      logger.warn(`Zoom unloading failed`, message, exception)
      throw exception
    }
  }
}(Zoom.sdk, logger.child({ from: 'ZoomSDK.native' })) // eslint-disable-line
