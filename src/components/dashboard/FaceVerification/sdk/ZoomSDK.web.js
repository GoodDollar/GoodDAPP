import { fromPairs, isEmpty, isString, noop, omitBy, pickBy, trimEnd, trimStart } from 'lodash'
import ConsoleSubscriber from 'console-subscriber'

import { store } from '../../../../lib/undux/SimpleStore'
import { showDialogWithData } from '../../../../lib/undux/utils/dialog'

import logger from '../../../../lib/logger/pino-logger'

import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import { UICustomization, UITextStrings, ZOOM_PUBLIC_PATH } from './UICustomization'
import { ProcessingSubscriber } from './ProcessingSubscriber'
import { EnrollmentProcessor } from './EnrollmentProcessor'

export const {
  // SDK initialization status codes enum
  ZoomSDKStatus,

  // Zoom session status codes enum
  ZoomSessionStatus,

  // Class which incapsulates all Zoom's customization options
  ZoomCustomization,
} = ZoomAuthentication.ZoomSDK

// sdk class
export const ZoomSDK = new class {
  /**
   * @var {Error}
   * @private
   */
  criticalPreloadException = null

  /**
   * @var {Promise}
   * @private
   */
  preloadCall = null

  constructor(sdk, store, logger) {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory(`${ZOOM_PUBLIC_PATH}/resources`)

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory(`${ZOOM_PUBLIC_PATH}/images`)

    // customize UI
    sdk.setCustomization(UICustomization)

    this.sdk = sdk
    this.store = store
    this.logger = logger
  }

  /**
   * Start zoom sdk preloading and save promise object to the class property
   *
   */
  async preload() {
    const { sdk, criticalPreloadException } = this
    const { ZoomPreloadResult } = sdk

    // re-throw critical exception (e.g.65391) if happened during last preload
    if (criticalPreloadException) {
      throw criticalPreloadException
    }

    if (!this.preloadCall) {
      const sdkCall = this.wrapCall(resolver => sdk.preload(resolver))

      this.preloadCall = sdkCall.finally(() => (this.preloadCall = null))
    }

    const preloadResult = await this.preloadCall

    if (preloadResult !== ZoomPreloadResult.Success) {
      throw new Error(`Couldn't preload Zoom SDK`)
    }
  }

  async initialize(licenseKey, licenseText = null, encryptionKey = null) {
    const { sdk, logger } = this
    const { Initialized, NeverInitialized, NetworkIssues, DeviceInLandscapeMode } = ZoomSDKStatus

    // waiting for Zoom preload to be finished before starting initialization
    await this.ensureZoomIsntPreloading()

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
    const { sdk, criticalPreloadException } = this

    try {
      // re-throw critical exception (e.g.65391) if happened during preload
      // to immediately jump onto catch block
      if (criticalPreloadException) {
        throw criticalPreloadException
      }

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

      // aslo there's possibility to this exception will be throwing during initialize() call
      // so we'll wrap this bock onto try...catch
      const isInitialized = await this.wrapCall(resolver => {
        // using one of four existing initiualize() overloads depending of which env variebles
        // (e.g. REACT_APP_ZOOM_ENCRYPTION_KEY and REACT_APP_ZOOM_LICENSE_TEXT) are set or not
        const initializeArgs = [licenseKey, encryptionKey || resolver]

        if (encryptionKey) {
          initializeArgs.push(resolver)
        }

        if (license) {
          /**
           * Production mode (REACT_APP_ZOOM_LICENSE_TEXT is set):
           * Initialize ZoomSDK using a Device SDK License - SFTP Log mode
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
         * Initialize ZoomSDK using a Device SDK License - HTTPS Log mode
         *
         * initialize: {
         *  // REACT_APP_ZOOM_ENCRYPTION_KEY is set
         *  (licenseKeyIdentifier: string, faceMapEncryptionKey: string, onInitializationComplete: (result: boolean) => void): void;
         *  // REACT_APP_ZOOM_ENCRYPTION_KEY isn't set
         *  (licenseKeyIdentifier: string, onInitializationComplete: (result: boolean) => void, preloadZoomSDK?: boolean | undefined): void;
         * }
         */
        sdk.initialize(...initializeArgs)
      })

      // if Zoom was initialized successfully
      if (isInitialized) {
        // customizing texts after initializaiton, according the docs
        this.configureLocalization()

        // resolving
        return isInitialized
      }
    } catch (exception) {
      // here we handling possible critical exception
      // we'll getting here if exception appers on initialize()
      // or it was rethrown as happened during preload()
      // we're re-reading exception from this (not the destructured)
      // for handle case when no critical exception was on preload()
      // but it appears on initialize()
      if (this.criticalPreloadException) {
        return this.showReloadPopup()
      }

      throw exception
    }

    const sdkStatus = sdk.getStatus()

    if (ZoomSDKStatus.NeverInitialized === sdkStatus) {
      // handling the case when we're trying to run SDK on emulated device
      const exception = new Error(
        "Initialize wasn't attempted as emulated device has been detected. " +
          'FaceTec ZoomSDK could be ran on the real devices only',
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
    const exception = new Error(sdk.getFriendlyDescriptionForZoomSDKStatus(sdkStatus))

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
      if (ZoomSessionStatus.PreloadNotCompleted === exception.code) {
        this.criticalPreloadException = exception
        return this.showReloadPopup()
      }

      throw exception
    }
  }

  async unload() {
    const { sdk, criticalPreloadException } = this

    if (criticalPreloadException) {
      return
    }

    await this.wrapCall(resolver => sdk.unload(resolver))
  }

  /**
   * Shows reload popup
   *
   * @private
   */
  // eslint-disable-next-line require-await
  async showReloadPopup() {
    const { criticalPreloadException: exception, logger, store } = this
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

  /**
   * Promisifies & wraps SDK calls. Also catches any unexpected errors such as ZoOm Error: 65391
   * @param {String} method
   * @param  {...any} args
   * @returns {Promise<any>}
   *
   * @private
   */
  // eslint-disable-next-line require-await
  async wrapCall(zoomCall) {
    const subscription = this.subscribeToZoomExceptions()

    return Promise.race([subscription.asPromise(), this.promisifyCall(zoomCall)]).finally(() =>
      subscription.unsubscrbe(),
    )
  }

  /**
   * Subscriibes to unexpected ZoOm errors
   *
   * @returns {Object} result
   * @private
   */
  subscribeToZoomExceptions() {
    let rejecter

    const errorHandler = errorEvent => {
      let isCriticalError
      const { error, filename } = errorEvent
      const { name, message } = error

      switch (name) {
        case 'ZoOm Error':
          isCriticalError = message.startsWith('65391')
          break
        case 'TypeError':
          isCriticalError = ['zoom/resources', 'lib/zoom'].some(path => filename.includes(path))
          break
        default:
          isCriticalError = false
      }

      if (isCriticalError) {
        this.criticalPreloadException = error
        rejecter(error)
      }
    }

    const consoleHandler = (category, [exception]) => {
      if ('error' !== category || !exception) {
        return
      }

      if (exception instanceof ErrorEvent) {
        errorHandler(exception)
        return
      }

      if (isString(exception)) {
        const [name, message] = exception.split(': ')

        if (!message) {
          return
        }

        errorHandler({ error: { name, message } })
      }
    }

    const subscriptionPromise = new Promise((_, reject) => {
      rejecter = reject

      window.addEventListener('error', errorHandler)
      ConsoleSubscriber.bind(consoleHandler)
    })

    return {
      asPromise: () => subscriptionPromise,
      unsubscrbe: () => {
        window.removeEventListener('error', errorHandler)
        ConsoleSubscriber.unbind()
      },
    }
  }

  /**
   * Promisifies SDK call.
   * @param {String} method
   * @param  {...any} args
   * @returns {Promise<any>}
   *
   * @private
   */
  // eslint-disable-next-line require-await
  async promisifyCall(zoomCall) {
    return new Promise((resolve, reject) => {
      try {
        zoomCall(resolve)
      } catch (exception) {
        reject(exception)
      }
    })
  }

  /**
   * Ensures Zoom isn't preloading or finished preload
   *
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line require-await
  async ensureZoomIsntPreloading() {
    const { preloadCall } = this

    if (!preloadCall) {
      return
    }

    return preloadCall.catch(noop)
  }
}(ZoomAuthentication.ZoomSDK, store, logger.child({ from: 'ZoomSDK.web' }))
