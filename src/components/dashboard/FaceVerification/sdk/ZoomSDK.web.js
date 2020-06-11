import React from 'react'
import { noop } from 'lodash'

import ReloadDialog from '../components/ReloadDialog'

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
    this.logger = logger
  }

  // eslint-disable-next-line require-await
  async preload() {
    const { sdk } = this
    const { ZoomPreloadResult } = sdk

    try {
      const preloadResult = await this.promisifyCall(resolver => sdk.preload(resolver))

      /* replace line above with this to emulate 65391

        const preloadResult = await this.promisifyCall(resolver => {
          setTimeout(() => {
            const exception = new Error('65391 Failed to load resource ZoOm core worker.')

            exception.name = 'ZoOm Error'
            throw exception
          })

          return sdk.preload(resolver)
        })
      */

      if (preloadResult !== ZoomPreloadResult.Success) {
        throw new Error(`Couldn't preload Zoom SDK`)
      }
    } catch (exception) {
      if (this.shouldReloadOn(exception)) {
        this.criticalPreloadException = exception
      }

      throw exception
    }
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey, preload = true) {
    const { sdk, store, logger, criticalPreloadException } = this

    // checking the last retrieved status code
    // if Zoom was already initialized successfully,
    // then resolving immediately
    if (ZoomSDKStatus.Initialized === sdk.getStatus()) {
      return
    }

    try {
      // re-throw critical exception (e.g.65391) if happened during preload
      if (criticalPreloadException) {
        throw criticalPreloadException
      }

      // aslo there's possibility to this exception will be throwing during initialize() call
      // so we'll wrap this bock onto try...catch
      const isInitialized = await this.promisifyCall(resolver => sdk.initialize(licenseKey, resolver, preload))

      /* replace line above with this to emulate 65391

        const isInitialized = await this.promisifyCall(resolver => {
          setTimeout(() => {
            const exception = new Error('65391 Failed to load resource ZoOm core worker.')

            exception.name = 'ZoOm Error'
            throw exception
          })

          return sdk.initialize(licenseKey, resolver, preload)
        })
      */

      // if Zoom was initialized successfully
      if (isInitialized) {
        // customizing UI texts. Doing it here, according the docs:
        //
        // Note: configureLocalization() MUST BE called after initialize() or initializeWithLicense().
        // @see https://dev.facetec.com/#/string-customization-guide?link=overriding-system-settings (scroll back one paragraph)
        //
        sdk.configureLocalization(UITextStrings.toJSON())

        // resolving
        return
      }
    } catch (exception) {
      // here we handling possible critical exception
      // we'll getting here if exception appers on initialize()
      // or it was rethrown as happened during preload()
      if (this.shouldReloadOn(exception)) {
        const currentStore = store.getCurrentSnapshot()

        showDialogWithData(currentStore, {
          type: 'error',
          isMinHeight: false,
          content: <ReloadDialog />,
          onDismiss: () => window.location.reload(true),
        })
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
  async faceVerification(enrollmentIdentifier, onUIReady = noop) {
    const subscriber = new ProcessingSubscriber(onUIReady, this.logger)
    const processor = new EnrollmentProcessor(subscriber)

    processor.enroll(enrollmentIdentifier)

    return subscriber.asPromise()
  }

  async unload() {
    await this.promisifyCall(resolver => this.sdk.unload(resolver))
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
  async promisifyCall(zoomCall) {
    let unexpectedError = null

    const errorHandler = ({ error }) => {
      const { name, message } = error

      if (name === 'ZoOm Error') {
        unexpectedError = new Error(message)
        unexpectedError.name = 'UnrecoverableError'
      }
    }

    const removeHandler = () => window.removeEventListener('error', errorHandler)

    window.addEventListener('error', errorHandler, { capture: true })

    return new Promise((resolve, reject) => {
      const resolver = resolvedValue => {
        removeHandler()

        unexpectedError ? reject(unexpectedError) : resolve(resolvedValue)
      }

      try {
        zoomCall(resolver)
      } catch (exception) {
        removeHandler()
        reject(exception)
      }
    })
  }

  /**
   * Checks if exception is so critical that requires webapp to be reloaded (e.g. 65391)
   *
   * @param {Error} exception
   * @private
   */
  shouldReloadOn(exception) {
    const { name, message } = exception

    return 'UnrecoverableError' === name && message.startsWith('65391')
  }
}(ZoomAuthentication.ZoomSDK, store, logger.child({ from: 'ZoomSDK' }))
