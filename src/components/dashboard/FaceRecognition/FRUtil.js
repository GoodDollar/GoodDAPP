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

type FRUtilResponse = {
  ok: boolean,
  error: string
}

const log = logger.child({ from: 'FaceRecognition' })

export const FRUtil = {
  async performFaceRecognition(captureResult: ZoomCaptureResult) {
    log.info({ captureResult })
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

  onFaceRecognitionResponse(result: FaceRecognitionResponse): FRUtilResponse {
    if (!result) {
      log.error('Bad response') // TODO: handle corrupted response
      return { ok: 0, error: 'Bad Response' }
    }
    log.info({ result })
    if (!result.ok || result.livenessPassed === false || result.isDuplicate === true || result.enrollResult === false)
      return this.onFaceRecognitionFailure(result)
    if (result.ok && result.enrollResult) this.onFaceRecognitionSuccess(result)
    else log.error('uknown error') // TODO: handle general error
    return { ok: 0, error: 'General Error' }
  },

  async onFaceRecognitionSuccess(res: FaceRecognitionResponse) {
    log.info('user passed Face Recognition successfully, res:')
    log.debug({ res })
    //    this.setState({ loadingFaceRecognition: true, loadingText: 'Saving Face Information to Your profile..' })
    try {
      await userStorage.setProfileField('zoomEnrollmentId', res.enrollResult.enrollmentIdentifier, 'private')
      return { ok: 1 }
    } catch (e) {
      log.error('failed to save facemap') // TODO: handle what happens if the facemap was not saved successfully to the user storage
      return { ok: 0, error: 'failed to save cpature information to user profile' }
    }
  },

  onFaceRecognitionFailure(result: FaceRecognitionResponse) {
    log.warn('user did not pass Face Recognition', result)
    let reason = ''
    if (result.livenessPassed === false) reason = 'Liveness Failed'
    else if (result.isDuplicate) reason = 'Face Already Exist'
    else reason = 'Enrollment Failed'

    return { ok: 0, error: reason }
  }
}

export default FRUtil
