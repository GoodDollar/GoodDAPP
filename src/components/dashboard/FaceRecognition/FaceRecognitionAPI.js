// @flow
import API from '../../../lib/API/api'
import { type ZoomCaptureResult } from './Zoom'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'

type FaceRecognitionResponse = {
  ok: boolean,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
  enrollResult?: object | false
}

type FaceRecognitionAPIResponse = {
  ok: boolean,
  error: string
}

const log = logger.child({ from: 'FaceRecognitionAPI' })
/**
 * Responsible to communicate with GoodServer and UserStorage on FaceRecognition related actions, and handle sucess / failure
 * * onFaceRecognitionFailure: Analyze the failure reason and returns a proper error message
 * * createFaceRecognitionReq - prepares the FR request for the server
 * * performFaceRecognition - calls the server API to perform FR process
 * * onFaceRecognitionResponse - Analyze the server result and call failure / success handler accordingly
 * * onFaceRecognitionSuccess - sets the enrollmentIdentifier (recivied from a successful FR process) on the user private storage
 */
export const FaceRecognitionAPI = {
  async performFaceRecognition(captureResult: ZoomCaptureResult) {
    log.info({ captureResult })
    if (!captureResult) return this.onFaceRecognitionFailure({ error: 'Failed to capture user' })
    let req = await this.createFaceRecognitionReq(captureResult)
    log.debug({ req })
    try {
      let res = await API.performFaceRecognition(req)
      return this.onFaceRecognitionResponse(res.data)
    } catch (e) {
      log.warn('General Error in FaceRecognition', e)
      return { ok: 0, error: 'Failed to perform face recognition on server' }
    }
  },

  async createFaceRecognitionReq(captureResult: ZoomCaptureResult) {
    let req = new FormData()
    req.append('sessionId', captureResult.sessionId)
    req.append('facemap', captureResult.facemap, { contentType: 'application/zip' })
    req.append('auditTrailImage', captureResult.auditTrailImage, { contentType: 'image/jpeg' })
    let account = await goodWallet.getAccountForType('zoomId')
    req.append('enrollmentIdentifier', account)
    log.debug({ req })
    return req
  },

  onFaceRecognitionResponse(result: FaceRecognitionResponse): FaceRecognitionAPIResponse {
    log.info({ result })
    if (
      !result ||
      !result.ok ||
      result.livenessPassed === false ||
      result.isDuplicate === true ||
      result.enrollResult === false ||
      result.enrollResult.ok === 0
    )
      return this.onFaceRecognitionFailure(result)
    else if (result.ok && result.enrollResult) return this.onFaceRecognitionSuccess(result)
    else {
      log.error('uknown error', { result }) // TODO: handle general error
      this.onFaceRecognitionFailure(result)
    }

    return { ok: 0, error: 'General Error' }
  },

  async onFaceRecognitionSuccess(res: FaceRecognitionResponse) {
    log.info('user passed Face Recognition successfully, res:')
    log.debug({ res })
    try {
      await userStorage.setProfileField('zoomEnrollmentId', res.enrollResult.enrollmentIdentifier, 'private')
      return { ok: 1 }
    } catch (e) {
      log.error('failed to save zoomEnrollmentId:', res.enrollResult.enrollmentIdentifier, e) // TODO: handle what happens if the facemap was not saved successfully to the user storage
      return { ok: 0, error: 'failed to save capture information to user profile' }
    }
  },

  onFaceRecognitionFailure(result: FaceRecognitionResponse) {
    log.warn('user did not pass Face Recognition', result)
    let reason = ''
    if (!result) reason = 'General Error'
    else if (result.error) reason = result.error
    else if (result.livenessPassed === false) reason = 'Liveness Failed'
    else if (result.isDuplicate) reason = 'Face Already Exist'
    else reason = 'Enrollment Failed'

    return { ok: 0, error: reason }
  }
}

export default FaceRecognitionAPI
