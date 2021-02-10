// @flow
import { noop, over } from 'lodash'

import FaceTec, { FaceTecUxEvent } from '@gooddollar/react-native-facetec'

import api from '../../../../lib/API/api'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

import { parseLicense } from '../utils/options'
import { MAX_RETRIES_ALLOWED } from './FaceTecSDK.constants'

export { FaceTecSDKStatus, FaceTecSessionStatus } from '@gooddollar/react-native-facetec'

// sdk class
export const FaceTecSDK = new class {
  constructor(sdk, logger) {
    this.sdk = sdk
    this.logger = logger
  }

  async initialize(licenseKey, encryptionKey = null, licenseText = null) {
    const { sdk, logger } = this
    const { serverUrl } = Config
    const license = parseLicense(licenseText)

    try {
      return await sdk.initialize(serverUrl, api.jwt, licenseKey, encryptionKey, license)
    } catch (exception) {
      const { message } = exception

      logger.warn(`FaceTec initialization failed`, message, exception)
      throw exception
    }
  }

  async faceVerification(enrollmentIdentifier, sessionOptions = null) {
    const { sdk, logger } = this
    // eslint-disable-next-line no-undef
    const { UI_READY, CAPTURE_DONE, FV_RETRY } = FaceTecUxEvent
    const { onUIReady = noop, onCaptureDone = noop, onRetry = noop, maxRetries = MAX_RETRIES_ALLOWED } =
      sessionOptions || {}

    // addListener calls returns unsubscibe functions we're storing in this array
    const subscriptions = [
      // subscribing to the native events
      sdk.addListener(UI_READY, onUIReady),
      sdk.addListener(CAPTURE_DONE, onCaptureDone),
      sdk.addListener(FV_RETRY, onRetry),
    ]

    try {
      return await sdk.enroll(enrollmentIdentifier, maxRetries)
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
