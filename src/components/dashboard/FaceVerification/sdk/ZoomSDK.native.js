// @flow
import { noop } from 'lodash'
import { NativeEventEmitter, NativeModules } from 'react-native'

import api from '../../../../lib/API/api'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'ZoomSDK' })

const { ZoomAuthentication } = NativeModules

const { ZoomUxEvent, preload, initialize, faceVerification, unload } = ZoomAuthentication

export const { ZoomSDKStatus, ZoomSessionStatus } = ZoomAuthentication

// sdk class
export const ZoomSDK = new class {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(ZoomAuthentication)
  }

  // eslint-disable-next-line require-await
  async preload() {
    try {
      await preload()
    } catch (exception) {
      this._convertCodeAndRethrow(exception, 'Zoom preloading')
    }
  }

  async initialize(licenseKey, preload) {
    try {
      await initialize(licenseKey, preload, Config.serverUrl, Config.zoomServerUrl)
    } catch (exception) {
      this._convertCodeAndRethrow(exception, 'Zoom initialization')
    }
  }

  async faceVerification(enrollmentIdentifier, onUIReady = noop) {
    // subscribing to UI_READY native event
    const unsubscribe = this._subscribeTo(ZoomUxEvent.UI_READY, onUIReady)

    try {
      // we're passing current JWT to the native code allowing it to call GoodServer for verification
      // unfortunately we couldn't pass callback which could return some data back to the native code
      // so it's only way to integrate Zoom on native - to reimplement all logic about calling server
      const verificationStatus = await faceVerification(enrollmentIdentifier, api.jwt)

      return verificationStatus
    } catch (exception) {
      this._convertCodeAndRethrow(exception, 'Face verification')
    } finally {
      // don't forgotting to ubsubscribe
      unsubscribe()
    }
  }

  // eslint-disable-next-line require-await
  async unload() {
    try {
      await unload()
    } catch (exception) {
      this._convertCodeAndRethrow(exception, 'Zoom unloading')
    }
  }

  // RCTBridge doesn't returns/rejects with JS Error object
  // it returns just object literal with the Error-like shape
  // also, codes are returning as strings (but actually Zoom statuses are numbers)
  // so we have to use this method to convert codes to numbers
  // and convert error-like shape to the JS Error object
  _convertCodeAndRethrow({ code, message }, logPrefix) {
    const exception = new Error(message)

    exception.code = Number(code)
    log.warn(`${logPrefix} failed`, { exception })

    throw exception
  }

  // helper for subscribing/unsubscring to native events
  _subscribeTo(event, handler) {
    let subscription = null
    const unsubscribe = () => {
      if (!subscription) {
        return
      }

      subscription.remove()
      subscription = null
    }

    subscription = this.eventEmitter.addListener(event, () => {
      unsubscribe()
      handler()
    })

    return unsubscribe
  }
}()
