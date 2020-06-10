import { noop } from 'lodash'

import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import logger from '../../../../lib/logger/pino-logger'
import { EnrollmentProcessor } from './EnrollmentProcessor'
import { ProcessingSubscriber } from './ProcessingSubscriber'
import { UICustomization, UITextStrings, ZOOM_PUBLIC_PATH } from './UICustomization'

const log = logger.child({ from: 'ZoomSDK' })

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
  preloadException = null

  constructor(sdk) {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory(`${ZOOM_PUBLIC_PATH}/resources`)

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory(`${ZOOM_PUBLIC_PATH}/images`)

    // customize UI
    sdk.setCustomization(UICustomization)

    this.sdk = sdk
  }

  // eslint-disable-next-line require-await
  async preload() {
    const { sdk } = this
    const { ZoomPreloadResult } = sdk

    try {
      const preloadResult = await this.promisifyCall(resolver => sdk.preload(resolver))

      if (preloadResult !== ZoomPreloadResult.Success) {
        throw new Error(`Couldn't preload Zoom SDK`)
      }

      this.preloadException = null
    } catch (exception) {
      this.preloadException = exception
      throw exception
    }
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey, preload = true) {
    const { sdk, preloadException } = this

    // eslint-disable-next-line
    const shouldReload = (exception = preloadException) => {
      const { name, message } = exception

      return 'UnrecoverableError' === name && message.startsWith('65391')
    }

    // checking the last retrieved status code
    // if Zoom was already initialized successfully,
    // then resolving immediately
    if (ZoomSDKStatus.Initialized === sdk.getStatus()) {
      return
    }

    const isInitialized = await this.promisifyCall(resolver => sdk.initialize(licenseKey, resolver, preload))

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
    log.warn('initialize failed', { exception })

    // rejecting with an error
    throw exception
  }

  // eslint-disable-next-line require-await
  async faceVerification(enrollmentIdentifier, onUIReady = noop) {
    const subscriber = new ProcessingSubscriber(onUIReady, log)
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
}(ZoomAuthentication.ZoomSDK)
