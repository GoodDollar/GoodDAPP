// @flow
import { noop } from 'lodash'
import Zoom, { ZoomUxEvent } from 'react-native-zoom' // eslint-disable-line

import api from '../../../../lib/API/api'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

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
      await sdk.initialize(licenseKey, preload, Config.serverUrl, Config.zoomServerUrl)
    } catch (exception) {
      const { message } = exception

      logger.warn(`Zoom initialization failed`, message, exception)
      throw exception
    }
  }

  async faceVerification(enrollmentIdentifier, onUIReady = noop) {
    const { sdk, logger } = this
    const { UI_READY } = ZoomUxEvent

    // subscribing to UI_READY native event
    sdk.addListener(UI_READY, onUIReady)

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
      sdk.removeListener(UI_READY, onUIReady)
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
}(Zoom.sdk, logger.child({ from: 'ZoomSDK' }))
