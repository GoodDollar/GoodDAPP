// @flow

import { NativeModules } from 'react-native'

import api from '../../../../lib/API/api'
import Config from '../../../../config/config'

const { ZoomAuthentication } = NativeModules

// added || {} safe stubs as we don't have native module yet
// eslint-disable-next-line no-unused-vars
const { preload, initialize, faceVerification } = ZoomAuthentication || {}

export const { ZoomSDKStatus, ZoomSessionStatus } = ZoomAuthentication || {}

// sdk class
export const ZoomSDK = new class {
  // eslint-disable-next-line require-await
  async preload() {
    try {
      // preload call commented as we don't have native module yet
      // so, for app init could pass we skippinh non-existed function call
      // await preload()
    } catch (exception) {
      this._convertCodeAndRethrow(exception)
    }
  }

  async initialize(licenseKey) {
    try {
      await initialize(licenseKey, Config.serverUrl)
    } catch (exception) {
      this._convertCodeAndRethrow(exception)
    }
  }

  async faceVerification() {
    try {
      // we're passing current JWT to the native code allowing it to call GoodServer for verification
      // unfortunately we couldn't pass callback which could return some data back to the native code
      // so it's only way to integrate Zoom on native - to reimplement all logic about calling server
      const verificationStatus = await faceVerification(api.jwt)

      return verificationStatus
    } catch (exception) {
      this._convertCodeAndRethrow(exception)
    }
  }

  // RCTBridge doesn't returns/rejects with JS Error object
  // it returns just object literal with the Error-like shape
  // also, codes are returning as strings (but actually Zoom statuses are numbers)
  // so we have to use this method to convert codes to numbers
  // and convert error-like shape to the JS Error object
  _convertCodeAndRethrow({ code, message }) {
    const exception = new Error(message)

    exception.code = Number(code)
    throw exception
  }
}()
