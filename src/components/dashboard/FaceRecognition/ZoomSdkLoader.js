// @flow
import loadjs from 'loadjs'
import logger from '../../../lib/logger/pino-logger'
import Config from '../../../config/config'
const log = logger.child({ from: 'ZoomSdkLoader' })

/**
 * Loads Zoom SDK
 */
declare var ZoomSDK: any
const licenseKey = Config.zoomLicenseKey

export class ZoomSdkLoader {
  ready = this.load()

  /* Orchestrates zoom loading & initialization process process */
  async load() {
    log.debug('loading zoom sdk..', { ZoomLoader: this })
    try {
      if (window.ZoomSDK === undefined && global.ZoomSDK === undefined) {
        log.debug('using loadjs to load ZoomSDK')
        await this.loadZoomSDK()
      }
      this.loadedZoom = ZoomSDK
      log.info('ZoomSDK loaded', this.loadedZoom)
      this.loadedZoom.zoomResourceDirectory('/ZoomAuthentication.js/resources/')
      await this.initializeAndPreload(this.loadedZoom) // TODO: what  to do in case of init errors?
      log.info('ZoomSDK initialized and preloaded', this.loadedZoom)
      return this.loadedZoom
    } catch (e) {
      log.error('initializing failed', e.message, e)

      return undefined
    }
  }

  /* Loads zoom SDK JS Files and runs them */
  loadZoomSDK(): Promise<void> {
    global.exports = {} // required by zoomSDK
    const server = Config.publicUrl
    log.info({ server })
    const zoomSDKPath = '/ZoomAuthentication.js/ZoomAuthentication.js'
    log.info(`loading ZoomSDK from ${zoomSDKPath}`)
    return loadjs(zoomSDKPath, { returnPromise: true })
  }

  async initializeAndPreload(zoomSDK: any): Promise<void> {
    await this.initialize(zoomSDK)
    await this.preload(zoomSDK)
  }

  /*Call ZoomSDK initialize with license key */
  initialize(zoomSDK: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!licenseKey) {
        return reject(new Error('No license key supplied in environment variable'))
      }

      log.info('initializing zoom ..')
      log.info({ zoomSDK })
      zoomSDK.initialize(licenseKey, (initializationSuccessful: boolean) => {
        log.info(`zoom initialization status: ${zoomSDK.getStatus()}`)
        if (initializationSuccessful) {
          log.info('zoom initialized successfully')
          resolve()
        }
        reject(new Error(`unable to initialize zoom sdk: ${zoomSDK.getStatus()}`))
      })
    })
  }

  /* Preloads Zoom SDK */
  preload(zoomSDK: any): Promise<void> {
    return new Promise((resolve, reject) => {
      //styleZoom(zoomSDK)
      zoomSDK.preload((preloadResult: any) => {
        if (preloadResult) {
          log.info('Preload status: ', { preloadResult })
          return resolve()
        }

        reject()
      })
    })
  }

  /* unload (sets undefined) zoom SDK from window, export, this */
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
