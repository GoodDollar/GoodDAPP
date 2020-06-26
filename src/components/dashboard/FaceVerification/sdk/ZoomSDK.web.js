import { isString, noop } from 'lodash'
import ConsoleSubscriber from 'console-subscriber'

import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import { showDialogWithData } from '../../../../lib/undux/utils/dialog'
import { store } from '../../../../lib/undux/SimpleStore'
import logger from '../../../../lib/logger/pino-logger'
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

  constructor(sdk, store, logger) {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory(`${ZOOM_PUBLIC_PATH}/resources`)

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory(`${ZOOM_PUBLIC_PATH}/images`)

    // customize UI
    sdk.setCustomization(UICustomization)

    this.sdk = sdk
    this.store = store
    this.logger = logger.child({ from: 'ZoomSDK.web' })
  }

  // eslint-disable-next-line require-await
  async preload() {
    const { sdk, criticalPreloadException } = this
    const { ZoomPreloadResult } = sdk

    // re-throw critical exception (e.g.65391) if happened during last preload
    if (criticalPreloadException) {
      throw criticalPreloadException
    }

    const preloadResult = await this.wrapCall(resolver => sdk.preload(resolver))

    if (preloadResult !== ZoomPreloadResult.Success) {
      throw new Error(`Couldn't preload Zoom SDK`)
    }
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey, preload = true) {
    const { sdk, logger, criticalPreloadException } = this

    // checking the last retrieved status code
    // if Zoom was already initialized successfully,
    // then resolving immediately
    if (ZoomSDKStatus.Initialized === sdk.getStatus()) {
      return
    }

    try {
      // re-throw critical exception (e.g.65391) if happened during preload
      // to immediately jump onto catch block
      if (criticalPreloadException) {
        throw criticalPreloadException
      }

      // aslo there's possibility to this exception will be throwing during initialize() call
      // so we'll wrap this bock onto try...catch
      const isInitialized = await this.wrapCall(resolver => sdk.initialize(licenseKey, resolver, preload))

      // if Zoom was initialized successfully
      if (isInitialized) {
        // customizing UI texts. Doing it here, according the docs:
        //
        // Note: configureLocalization() MUST BE called after initialize() or initializeWithLicense().
        // @see https://dev.facetec.com/#/string-customization-guide?link=overriding-system-settings (scroll back one paragraph)
        //
        sdk.configureLocalization(UITextStrings.toJSON())

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
        this.showReloadPopup()

        return false
      }

      throw exception
    }

    const sdkStatus = sdk.getStatus()

    // retrieving full description from status code
    const exception = new Error(
      ZoomSDKStatus.NeverInitialized === sdkStatus
        ? "Initialize wasn't attempted as emulated device has been detected. " +
          'FaceTec ZoomSDK could be ran on the real devices only'
        : sdk.getFriendlyDescriptionForZoomSDKStatus(sdkStatus)
    )

    // adding status code as error's object property
    exception.code = sdkStatus
    logger.warn('initialize failed', { exception })

    // rejecting with an error
    throw exception
  }

  // eslint-disable-next-line require-await
  async faceVerification(enrollmentIdentifier, onUIReady = noop, onCaptureDone = noop, onRetry = noop) {
    const subscriber = new ProcessingSubscriber(onUIReady, onCaptureDone, onRetry, this.logger)

    const processor = new EnrollmentProcessor(subscriber)

    processor.enroll(enrollmentIdentifier)

    return subscriber.asPromise()
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
  showReloadPopup() {
    const store = this.store.getCurrentSnapshot()
    const { criticalPreloadException } = this
    const { message } = criticalPreloadException

    this.logger.error('Failed to preload ZoOm SDK', message, criticalPreloadException)

    showDialogWithData(store, {
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
      subscription.unsubscrbe()
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
          isCriticalError = filename.includes('zoom/resources')
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
}(ZoomAuthentication.ZoomSDK, store, logger.child({ from: 'ZoomSDK' }))
