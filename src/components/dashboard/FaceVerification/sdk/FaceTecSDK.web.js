import logger from '../../../../lib/logger/pino-logger'

import FaceTec from '../../../../lib/facetec/FaceTecSDK'
import { parseLicense, parseVerificationOptions } from '../utils/options'
import { FACETEC_PUBLIC_PATH, UICustomization, UITextStrings } from './UICustomization'
import { ProcessingSubscriber } from './ProcessingSubscriber'
import { EnrollmentProcessor } from './EnrollmentProcessor'

export const {
  // SDK initialization status codes enum
  FaceTecSDKStatus,

  // Zoom session status codes enum
  FaceTecSessionStatus,

  // Class which incapsulates all Zoom's customization options
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
        // we dont need to invoke initialize again if some non-unrecoverable errors occurred
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
  async initializationAttempt(licenseKey, encryptionKey, licenseText) {
    const { sdk, logger } = this
    const license = parseLicense(licenseKey)

    logger.debug('FaceTec SDK initialization attempt', { licenseKey, encryptionKey, license })

    const isInitialized = await new Promise((resolve, reject) => {
      // using one of two existing initialize() overloads depending of which mode is used
      // (dev or prod) determined by the REACT_APP_ZOOM_LICENSE_TEXT envvar is set or not
      const initializeArgs = [licenseKey, encryptionKey, resolve]
      const faceTecEnv = license ? 'Production' : 'Development'

      if (license) {
        // pre-pending args with production key which is need to be passed
        // as the first one arg to the initializeInProductionMode()
        initializeArgs.unshift(license)
      }

      logger.debug(`initializeIn${faceTecEnv}Mode`, initializeArgs)

      try {
        sdk[`initializeIn${faceTecEnv}Mode`](...initializeArgs)
      } catch (exception) {
        reject(exception)
      }
    })

    // if Zoom was initialized successfully
    if (isInitialized) {
      // customizing texts after initializaiton, according the docs
      this.configureLocalization()

      // resolving
      return isInitialized
    }

    const sdkStatus = sdk.getStatus()

    if (FaceTecSDKStatus.NeverInitialized === sdkStatus) {
      // handling the case when we're trying to run SDK on emulated device
      const exception = new Error(
        "Initialize wasn't attempted as emulated device has been detected. " +
          'FaceTec FaceTecSDK could be ran on the real devices only',
      )

      exception.code = sdkStatus
      throw exception
    }

    // otherwise throwing exception based on the new status we've got after initialize() call
    this.throwExceptionFromStatus(sdkStatus)
  }

  /**
   * @private
   */
  configureLocalization() {
    // customizing UI texts. This method should be invoked after successfull initializatoin, according the docs:
    //
    // Note: configureLocalization() MUST BE called after initialize() or initializeWithLicense().
    // @see https://dev.facetec.com/#/string-customization-guide?link=overriding-system-settings (scroll back one paragraph)
    //
    this.sdk.configureLocalization(UITextStrings.toJSON())
  }

  /**
   * @private
   */
  throwExceptionFromStatus(sdkStatus) {
    const { sdk, logger } = this

    // retrieving full description from status code
    const exception = new Error(sdk.getFriendlyDescriptionForFaceTecSDKStatus(sdkStatus))

    // adding status code as error's object property
    exception.code = sdkStatus
    logger.warn('initialize failed', { exception })

    throw exception
  }
}(FaceTec.FaceTecSDK, logger.child({ from: 'FaceTecSDK.web' }))
