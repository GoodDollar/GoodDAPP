import { fromPairs, isEmpty, noop, omitBy, pickBy, trimEnd, trimStart } from 'lodash'

import { store } from '../../../../lib/undux/SimpleStore'
import { showDialogWithData } from '../../../../lib/undux/utils/dialog'

import logger from '../../../../lib/logger/pino-logger'

import FaceTec from '../../../../lib/facetec/FaceTecSDK'
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
  constructor(sdk, store, logger) {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory(`${FACETEC_PUBLIC_PATH}/resources`)

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory(`${FACETEC_PUBLIC_PATH}/images`)

    // customize UI
    sdk.setCustomization(UICustomization)

    this.sdk = sdk
    this.store = store
    this.logger = logger
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey, licenseText = null, encryptionKey = null) {
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
        return this.initializationAttempt(licenseKey, licenseText, encryptionKey)

      default:
        // for other error status just re-throwing the corresponding exceptions
        this.throwExceptionFromStatus(sdkStatus)
    }
  }

  async initializationAttempt(licenseKey, licenseText, encryptionKey) {
    let license = null
    const { sdk } = this

    if (licenseText) {
      // JavaScript SDK accepts object literal, converting license text to it
      license = fromPairs(
        licenseText
          .split('\n') // exclude native-only 'appId' option from license text
          .filter(line => !isEmpty(line) && line.includes('=') && !line.includes('appId'))
          .map(line => {
            const [option, value = ''] = line.split('=')

            return [trimEnd(option), trimStart(value)]
          }),
      )
    }

    const isInitialized = await new Promise((resolve, reject) => {
      // using one of four existing initiualize() overloads depending of which env variebles
      // (e.g. REACT_APP_ZOOM_ENCRYPTION_KEY and REACT_APP_ZOOM_LICENSE_TEXT) are set or not
      const initializeArgs = [licenseKey, encryptionKey || resolve]

      if (encryptionKey) {
        initializeArgs.push(resolve)
      }

      try {
        if (license) {
          /**
           * Production mode (REACT_APP_ZOOM_LICENSE_TEXT is set):
           * Initialize FaceTecSDK using a Device SDK License - SFTP Log mode
           *
           * initializeWithLicense: {
           *  // REACT_APP_ZOOM_ENCRYPTION_KEY is set
           *  (licenseText: string, licenseKeyIdentifier: string, faceMapEncryptionKey: string, onInitializationComplete: (result: boolean) => void): void;
           *  // REACT_APP_ZOOM_ENCRYPTION_KEY isn't set
           *  (licenseText: string, licenseKeyIdentifier: string, onInitializationComplete: (result: boolean) => void): void;
           * }
           */
          initializeArgs.unshift(license)
          sdk.initializeWithLicense(...initializeArgs)
          return
        }

        /**
         * Non-production mode (REACT_APP_ZOOM_LICENSE_TEXT isn't set):
         * Initialize FaceTecSDK using a Device SDK License - HTTPS Log mode
         *
         * initialize: {
         *  // REACT_APP_ZOOM_ENCRYPTION_KEY is set
         *  (licenseKeyIdentifier: string, faceMapEncryptionKey: string, onInitializationComplete: (result: boolean) => void): void;
         *  // REACT_APP_ZOOM_ENCRYPTION_KEY isn't set
         *  (licenseKeyIdentifier: string, onInitializationComplete: (result: boolean) => void, preloadFaceTecSDK?: boolean | undefined): void;
         * }
         */
        sdk.initialize(...initializeArgs)
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

  configureLocalization() {
    // customizing UI texts. This method should be invoked after successfull initializatoin, according the docs:
    //
    // Note: configureLocalization() MUST BE called after initialize() or initializeWithLicense().
    // @see https://dev.facetec.com/#/string-customization-guide?link=overriding-system-settings (scroll back one paragraph)
    //
    this.sdk.configureLocalization(UITextStrings.toJSON())
  }

  throwExceptionFromStatus(sdkStatus) {
    const { sdk, logger } = this

    // retrieving full description from status code
    const exception = new Error(sdk.getFriendlyDescriptionForFaceTecSDKStatus(sdkStatus))

    // adding status code as error's object property
    exception.code = sdkStatus
    logger.warn('initialize failed', { exception })

    throw exception
  }

  // eslint-disable-next-line require-await
  async faceVerification(enrollmentIdentifier, sessionOptions = null) {
    const eventMatcher = (_, option) => option.startsWith('on')
    const eventCallbacks = pickBy(sessionOptions || {}, eventMatcher)
    const options = omitBy(sessionOptions, eventMatcher)
    const subscriber = new ProcessingSubscriber(eventCallbacks, this.logger)
    const processor = new EnrollmentProcessor(subscriber, options)

    try {
      processor.enroll(enrollmentIdentifier)

      return await subscriber.asPromise()
    } catch (exception) {
      if (FaceTecSessionStatus.PreloadNotCompleted === exception.code) {
        return this.showReloadPopup(exception)
      }

      throw exception
    }
  }

  /**
   * Shows reload popup
   *
   * @private
   */
  // eslint-disable-next-line require-await
  async showReloadPopup(exception) {
    const { logger, store } = this
    const storeSnapshot = store.getCurrentSnapshot()
    const { message } = exception

    logger.error('Failed to preload ZoOm SDK', message, exception, { dialogShown: true })

    showDialogWithData(storeSnapshot, {
      type: 'error',
      isMinHeight: false,
      message: "We couldn't start face verification,\nplease reload the app.",
      onDismiss: () => window.location.reload(true),
      buttons: [
        {
          text: 'REFRESH',
        },
      ],
    })

    // return never ending Promise so app will stuck in the 'loading state'
    // on the backgroumnd of the reload dialog
    return new Promise(noop)
  }
}(FaceTec.FaceTecSDK, store, logger.child({ from: 'FaceTecSDK.web' }))
