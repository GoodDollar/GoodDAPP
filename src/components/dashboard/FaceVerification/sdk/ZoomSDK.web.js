import { omit } from 'lodash'

import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import logger from '../../../../lib/logger/pino-logger'
import { EnrollmentProcessor } from './EnrollmentProcessor'
import UICustomization, { ZOOM_PUBLIC_PATH } from './UICustomization'

const log = logger.child({ from: 'ZoomSDK' })

// Zoom SDK reference
const { ZoomSDK: sdk } = ZoomAuthentication

export const {
  // SDK initialization status codes enum
  ZoomSDKStatus,

  // Zoom session status codes enum
  ZoomSessionStatus,

  // Class which incapsulates all Zoom's customization options
  ZoomCustomization,
} = sdk

const {
  // Zoom prelaod result codes enum
  ZoomPreloadResult,

  // Helper function, returns full description
  // for SDK initialization status specified
  getFriendlyDescriptionForZoomSDKStatus,
} = sdk

// sdk class
export const ZoomSDK = new class {
  constructor() {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory(`${ZOOM_PUBLIC_PATH}/resources`)

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory(`${ZOOM_PUBLIC_PATH}/images`)

    sdk.setCustomization(UICustomization)
  }

  // eslint-disable-next-line require-await
  async preload() {
    return new Promise((resolve, reject) => {
      try {
        sdk.preload(status => {
          if (status === ZoomPreloadResult.Success) {
            resolve()
            return
          }

          const exception = new Error(`Couldn't preload Zoom SDK`)

          log.warn('preload failed', { exception })
          reject(exception)
        })
      } catch (exception) {
        reject(exception)
      }
    })
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey, preload = true) {
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
          isInitialized => {
            // if Zoom was initialized successfully - resolving
            if (isInitialized) {
              resolve()
              return
            }

            const sdkStatus = sdk.getStatus()

            // retrieving full description from status code
            const exception = new Error(
              ZoomSDKStatus.NeverInitialized === sdkStatus
                ? "Initialize wasn't attempted as emulated device has been detected. " +
                  'FaceTec ZoomSDK could be ran on the real devices only'
                : getFriendlyDescriptionForZoomSDKStatus(sdkStatus)
            )

            // adding status code as error's object property
            exception.code = sdkStatus
            log.warn('initialize failed', { exception })

            // rejecting with an error
            reject(exception)
          },
          preload
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
      const processor = new EnrollmentProcessor((isSuccess, lastResult, lastMessage) => {
        const logRecord = { isSuccess, lastMessage }

        if (lastResult) {
          logRecord.lastResult = omit(lastResult, 'faceMetrics')
        }

        log[isSuccess ? 'info' : 'warn']('processor result:', logRecord)

        if (isSuccess) {
          resolve(lastMessage)
        }

        const exception = new Error(lastMessage)

        if (lastResult) {
          exception.code = lastResult.status
        }

        reject(exception)
      })

      processor.enroll(enrollmentIdentifier)
    })
  }

  // eslint-disable-next-line require-await
  async unload() {
    return new Promise((resolve, reject) => {
      try {
        sdk.unload(resolve)
      } catch (exception) {
        reject(exception)
      }
    })
  }
}()
