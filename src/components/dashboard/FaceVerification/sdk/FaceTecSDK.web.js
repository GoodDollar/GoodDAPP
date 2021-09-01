import { assign, get, isString } from 'lodash'

import logger from '../../../../lib/logger/js-logger'

import FaceTec from '../../../../lib/facetec/FaceTecSDK'
import { parseVerificationOptions } from '../utils/options'
import { FACETEC_PUBLIC_PATH, UICustomization, UITextStrings } from './UICustomization'
import { ProcessingSubscriber } from './ProcessingSubscriber'
import { EnrollmentProcessor } from './EnrollmentProcessor'

export const {
  // SDK initialization status codes enum
  FaceTecSDKStatus,

  // Zoom session status codes enum
  FaceTecSessionStatus,

  // Class which encapsulates all Zoom's customization options
  FaceTecCustomization,
} = FaceTec.FaceTecSDK

// sdk class
export const FaceTecSDK = new class {
  constructor(sdk, logger) {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory(`${FACETEC_PUBLIC_PATH}/resources`)

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory(`${FACETEC_PUBLIC_PATH}/images`)

    // customize UI
    sdk.setCustomization(UICustomization)

    this.sdk = sdk
    this.logger = logger
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey, encryptionKey = null, licenseText = null) {
    const { sdk, logger } = this
    const { Initialized, NeverInitialized, NetworkIssues, DeviceInLandscapeMode } = FaceTecSDKStatus

    const sdkStatus = sdk.getStatus()

    logger.debug('zoom sdk status', { sdkStatus })

    switch (sdkStatus) {
      case Initialized:
      case DeviceInLandscapeMode:
        // we don't need to invoke initialize again if some non-unrecoverable errors occurred
        this.configureLocalization()
        return true

      case NeverInitialized:
      case NetworkIssues:
        // we need to invoke initialize again if network issues happened during last call
        return this.initializationAttempt(licenseKey, encryptionKey, licenseText)

      default:
        // for other error status just re-throwing the corresponding exceptions
        this.throwExceptionFromStatus(sdkStatus)
    }
  }

  // eslint-disable-next-line require-await
  async faceVerification(enrollmentIdentifier, sessionOptions = null) {
    const { logger } = this
    const { eventCallbacks, options } = parseVerificationOptions(sessionOptions)

    const subscriber = new ProcessingSubscriber(eventCallbacks, logger)
    const processor = new EnrollmentProcessor(subscriber, options)

    processor.enroll(enrollmentIdentifier)
    return subscriber.asPromise()
  }

  /**
   * @private
   */
  async initializationAttempt(licenseKey, encryptionKey, license) {
    const { sdk, logger } = this
    const { NeverInitialized, KeyExpiredOrInvalid } = FaceTecSDKStatus

    logger.debug('FaceTec SDK initialization attempt', { licenseKey, encryptionKey, license })

    try {
      const isInitialized = await new Promise((resolve, reject) => {
        const initializationCallback = initialized => {
          unsubscribe()
          resolve(initialized)
        }

        const exceptionCallback = exception => {
          unsubscribe()
          reject(exception)
        }

        // i was wrong thinking ResourcesCouldNotBeLoadedOnLastInit solve all issues
        // with unexpected Zoom errors. Actually there're still some cases
        // (e.g. invalid / absent encryption key) when Zoom doesn't throws an exception
        // just logs it onto the console. So we still need to listen console.error calls
        // as we did it in v8
        const unsubscribe = this.listenBrowserSDKErrors(exceptionCallback)

        try {
          // using one of two existing initialize() overloads depending of which mode is used
          // (dev or prod) determined by the REACT_APP_ZOOM_LICENSE_TEXT env var is set or not
          if (license) {
            sdk.initializeInProductionMode(license, licenseKey, encryptionKey, initializationCallback)
            return
          }

          sdk.initializeInDevelopmentMode(licenseKey, encryptionKey, initializationCallback)
        } catch (exception) {
          exceptionCallback(exception)
        }
      })

      // if Zoom was initialized successfully
      if (isInitialized) {
        // customizing texts after initialization, according the docs
        this.configureLocalization()

        // resolving
        return isInitialized
      }
    } catch (exception) {
      // handle FaceTec Browser SDK Error Code 980897: Invalid publicEncryptionKey parameter passed to initialize
      if (/invalid.+parameter.+passed/i.test(exception.message)) {
        this.throwExceptionFromStatus(KeyExpiredOrInvalid)
      }

      this.throwException(exception)
    }

    const sdkStatus = sdk.getStatus()

    // trowing exception based on the new status we've got after initialize() call
    this.throwExceptionFromStatus(
      sdkStatus,
      NeverInitialized !== sdkStatus
        ? null
        : // handling the case when we're trying to run SDK on emulated device
          'Emulated device has been detected, SDK not initialized. FaceTecSDK could be run on real devices only',
    )
  }

  /**
   * @private
   */
  configureLocalization() {
    // customizing UI texts. This method should be invoked after successful initialization, according the docs:
    //
    // Note: configureLocalization() MUST BE called after initialize() or initializeWithLicense().
    // @see https://dev.facetec.com/#/string-customization-guide?link=overriding-system-settings (scroll back one paragraph)
    //
    this.sdk.configureLocalization(UITextStrings.toJSON())
  }

  /**
   * @private
   */
  listenBrowserSDKErrors(callback) {
    const logStream = window.console
    const { error: originalLogError } = logStream
    const faceTecErrorRegexp = /facetec.+browser.+sdk.+error.+code.+?(\d+).*?:\s*?(.+)$/i

    logStream.error = (...loggedArgs) => {
      let matches
      const logged = get(loggedArgs, '[0][0]')

      if (isString(logged) && (matches = faceTecErrorRegexp.exec(logged))) {
        const [, code, message] = matches
        const exception = new Error(message)

        assign(exception, { code })
        callback(exception)
      }

      return originalLogError.apply(logStream, loggedArgs)
    }

    return () => void (logStream.error = originalLogError)
  }

  /**
   * @private
   */
  throwException(exception) {
    const { logger } = this

    logger.warn('initialize failed', { exception })
    throw exception
  }

  /**
   * @private
   */
  throwExceptionFromStatus(sdkStatus, customMessage = null) {
    // if no custom message set - retrieving full description from status code
    const exception = new Error(customMessage || this.sdk.getFriendlyDescriptionForFaceTecSDKStatus(sdkStatus))

    // adding status code as error's object property
    exception.code = sdkStatus
    this.throwException(exception)
  }
}(FaceTec.FaceTecSDK, logger.get('FaceTecSDK.web'))
