// @flow
import logger from '../../../lib/logger/pino-logger'

/**
 * An object responsible to all Zoom actions and interactions
 */
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
export const capture = (zoomSDK: any, videoTrack: MediaStreamTrack): Promise<ZoomCaptureResult> =>
  new Promise((resolve, reject) => {
    let ZoomSDK = zoomSDK
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
