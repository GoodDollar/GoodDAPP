import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import logger from '../../../../lib/logger/pino-logger'
import { EnrollmentProcessor } from './EnrollmentProcessor'

const log = logger.child({ from: 'ZoomSDK' })

// Zoom SDK reference
const { ZoomSDK: sdk } = ZoomAuthentication

export const {
  // SDK initialization status codes enum
  ZoomSDKStatus,

  // Zoom session status codes enum
  ZoomSessionStatus,
} = sdk

const {
  // Zoom prelaod result codes enum
  ZoomPreloadResult,

  // Helper function, returns full description
  // for SDK initialization status specified
  getFriendlyDescriptionForZoomSDKStatus,

  // Zoom verification session incapsulation
  ZoomSession,
} = sdk

// sdk class
export const ZoomSDK = new class {
  constructor() {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory('/zoom/resources')

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory('/zoom/images')
  }

  // eslint-disable-next-line require-await
  async preload() {
    return new Promise(
      (resolve, reject) =>
        void sdk.preload(status => {
          if (status === ZoomPreloadResult.Success) {
            resolve()
            return
          }

          const exception = new Error(`Couldn't preload Zoom SDK`)
          log.warn('preload failed', { exception })
          exception.code = status
          reject(exception)
        })
    )
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey) {
    // checking the last retrieved status code
    // if Zoom was already initialized successfully,
    // then resolving immediately
    if (ZoomSDKStatus.Initialized === sdk.getStatus()) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        // initializing ZoOm and configuring the UI features.
        sdk.initialize(
          licenseKey,
          () => {
            const sdkStatus = sdk.getStatus()

            // if Zoom was initialized successfully - resolving
            if (ZoomSDKStatus.Initialized === sdkStatus) {
              resolve()
              return
            }

            // retrieving full description from status code
            const exception = new Error(getFriendlyDescriptionForZoomSDKStatus(sdkStatus))

            // adding status code as error's object property
            exception.code = sdkStatus
            log.warn('initialize failed', { exception })

            // rejecting with an error
            reject(exception)
          },
          true
        )
      } catch (exception) {
        // handling initialization exceptions
        // (some of them could be thrown during initialize() call)
        reject(exception)
      }
    })
  }

  // eslint-disable-next-line require-await
  async faceVerification(enrollmentIdentifier) {
    return new Promise((resolve, reject) => {
      // as now all this stuff is outside React hook
      // we could just implement it like in the demo app
      const processor = new EnrollmentProcessor(enrollmentIdentifier, (isSuccess, lastResult, lastMessage) => {
        log.warn('processor result:', { isSuccess, lastResult, lastMessage })

        if (isSuccess) {
          resolve(lastMessage)
        }

        const exception = new Error(lastMessage)

        exception.code = lastResult.status
        reject(exception)
      })

      new ZoomSession(() => processor.handleCompletion(), processor)
    })
  }
}()
