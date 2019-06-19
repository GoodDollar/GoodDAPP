// @flow
import logger from '../../../lib/logger/pino-logger'
import Config from '../../../config/config'

var ZoomSDK: any

export type ZoomCaptureResult = {
  status: any,
  sessionId: string,
  facemap: Blob,
  auditTrailImage: Blob,
  faceMetrics: {
    auditTrail: string[]
  }
}

const log = logger.child({ from: 'Zoom' })
const licenseKey = Config.zoomLicenseKey
log.info({ licenseKey })

const initialize = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!licenseKey) {
      return reject(new Error('No license key supplied in environment variable'))
    }

    log.info('initializing zoom ..')
    log.info({ ZoomSDK })
    ZoomSDK.initialize(licenseKey, (initializationSuccessful: boolean) => {
      log.info(`zoom initialization status: ${ZoomSDK.getStatus()}`)
      if (initializationSuccessful) {
        log.info('zoom initialized successfully')
        resolve()
      }
      reject(new Error(`unable to initialize zoom sdk: ${ZoomSDK.getStatus()}`))
    })
  })

const preload = (): Promise<void> =>
  new Promise((resolve, reject) => {
    ZoomSDK.preload((preloadResult: any) => {
      if (preloadResult) {
        log.info('Preload status: ', { preloadResult })
        return resolve()
      }

      reject()
    })
  })

export const initializeAndPreload = async (zoomSDK: any): Promise<void> => {
  ZoomSDK = zoomSDK
  await initialize()
  await preload()
}

export const capture = (videoTrack: MediaStreamTrack): Promise<ZoomCaptureResult> =>
  new Promise((resolve, reject) => {
    log.info('ZoomSDK = ', { ZoomSDK })
    ZoomSDK.prepareInterface('zoom-interface-container', 'zoom-video-element', (prepareInterfaceResult: any) => {
      if (prepareInterfaceResult !== ZoomSDK.ZoomTypes.ZoomPrepareInterfaceResult.Success) {
        return reject(new Error(`unable to prepare zoom interface: ${prepareInterfaceResult}`))
      }

      const zoomSession = new ZoomSDK.ZoomSession((result: ZoomCaptureResult) => {
        if (result.status !== ZoomSDK.ZoomTypes.ZoomCaptureResult.SessionCompleted || !result.facemap) {
          return reject(new Error(`unsuccessful capture result: ${result.status}`))
        }

        auditTrailImageToBlob(result.faceMetrics.auditTrail[0])
          .then(auditTrailImage => resolve({ ...result, auditTrailImage }))
          .catch(() => resolve(result))
      }, videoTrack)

      zoomSession.capture()
    })
  })

const auditTrailImageToBlob = async (auditTrailImage: string): Promise<Blob> => (await fetch(auditTrailImage)).blob() // because this is a data url (it's all local) - efficent way to convert to binary process
