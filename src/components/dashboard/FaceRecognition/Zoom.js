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
    auditTrail: string[],
  },
}

const log = logger.child({ from: 'Zoom' })

class Zoom {
  ready: Promise<any>

  zoomSDK: any

  zoomSession: any

  videoTrack: MediaStreamTrack

  constructor(zoomSDK: any) {
    this.zoomSDK = zoomSDK
    this.ready = new Promise((resolve, reject) => {
      let ZoomSDK = zoomSDK
      log.info('ZoomSDK = ', { ZoomSDK })
      ZoomSDK.prepareInterface('zoom-interface-container', 'zoom-video-element', (prepareInterfaceResult: any) => {
        if (prepareInterfaceResult !== ZoomSDK.ZoomTypes.ZoomPrepareInterfaceResult.Success) {
          return reject(new Error(`unable to prepare zoom interface: ${prepareInterfaceResult}`))
        }
        resolve()
      })
    })
  }

  async capture(videoTrack: MediaStreamTrack) {
    this.videoTrack = videoTrack
    await this.ready
    let ZoomSDK = this.zoomSDK
    const res = new Promise((resolve, reject) => {
      this.zoomSession = new ZoomSDK.ZoomSession((result: ZoomCaptureResult) => {
        if (result.status === ZoomSDK.ZoomTypes.ZoomCaptureResult.ProgramaticallyCancelled) {
          return resolve()
        }

        if (result.status !== ZoomSDK.ZoomTypes.ZoomCaptureResult.SessionCompleted || !result.facemap) {
          return reject(new Error(`unsuccessful capture result: ${result.status}`))
        }

        auditTrailImageToBlob(result.faceMetrics.auditTrail[0])
          .then(auditTrailImage => resolve({ ...result, auditTrailImage }))
          .catch(() => resolve(result))
      }, this.videoTrack)
      this.zoomSession.capture()
    })
    return res
  }

  async cancel() {
    await this.ready.catch(_ => _)
    this.zoomSession && this.zoomSession.cancel()
  }
}

const auditTrailImageToBlob = async (auditTrailImage: string): Promise<Blob> => (await fetch(auditTrailImage)).blob() // because this is a data url (it's all local) - efficent way to convert to binary process
export default Zoom
