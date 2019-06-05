// @flow
import logger from '../../../lib/logger/pino-logger'
import loadjs from 'loadjs'
import Config from '../../../config/config'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'
const log = logger.child({ from: 'ZoomSdkLoader' })

/**
 * Loads Zoom SDK
 */
declare var ZoomSDK: any

export class ZoomSdkLoader {
  async load() {
    log.debug('loading zoom sdk..')
    try {
      await this.loadZoomSDK()
      this.loadedZoom = ZoomSDK
      log.info('ZoomSDK loaded', this.loadedZoom)
      this.loadedZoom.zoomResourceDirectory('/ZoomAuthentication.js/resources')
      await initializeAndPreload(this.loadedZoom) // TODO: what  to do in case of init errors?
      log.info('ZoomSDK initialized and preloaded', this.loadedZoom)
      return this.loadedZoom
    } catch (e) {
      log.error(e)
      log.error('initializing failed', e)

      return undefined
    }
  }

  loadZoomSDK(): Promise<void> {
    global.exports = {} // required by zoomSDK
    const server = Config.publicUrl
    log.info({ server })
    const zoomSDKPath = '/ZoomAuthentication.js/ZoomAuthentication.js'
    log.info(`loading ZoomSDK from ${zoomSDKPath}`)
    return loadjs(zoomSDKPath, { returnPromise: true })
  }

  unload(): void {
    log.debug('Unloading ZoomSDK?', !!this.loadedZoom)
    this.loadedZoom &&
      this.loadedZoom.unload(() => {
        window.ZoomSDK = null
        exports.ZoomSDK = null
        this.loadedZoom = null
        log.debug('ZoomSDK unloaded')
      })
  }
}

export default new ZoomSdkLoader()
