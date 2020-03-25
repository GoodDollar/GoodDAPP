// @flow
import API from '../../../lib/API/api'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'
import { type ZoomCaptureResult } from './Zoom'

type FaceRecognitionResponse = {
  ok: boolean,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
  enrollResult?: any | false,
}

type FaceRecognitionAPIResponse = {
  ok: boolean,
  error: string,
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
    if (!captureResult) {
      return this.onFaceRecognitionFailure({ error: 'Failed to capture user' })
    }
    let req = await this.createFaceRecognitionReq(captureResult)
    log.debug({ req })
    try {
      let res = await API.performFaceRecognition(req)
      return this.onFaceRecognitionResponse(res.data)
    } catch (e) {
      log.error('General Error in FaceRecognition', e.message, e)
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
    if (!result || !result.ok) {
      return this.onFaceRecognitionFailure(result)
    } else if (result.ok) {
      return this.onFaceRecognitionSuccess(result)
    }

    log.error('Face recognition response failed', 'unknown error', null, { result }) // TODO: handle general error
    this.onFaceRecognitionFailure(result)

    return { ok: 0, error: 'General Error' }
  },

  onFaceRecognitionSuccess(res: FaceRecognitionResponse) {
    log.info('Face Recognition finished successfull', { res })
    return { ok: 1, ...res }
  },

  onFaceRecognitionFailure(result: FaceRecognitionResponse) {
    log.warn('user did not pass Face Recognition', result)
    let reason = ''
    if (!result) {
      reason = 'General Error'
    } else if (result.error) {
      reason = result.error
    }

    //TODO: Rami - should i handle this error as well, or is it on Liav's verification screen
    return { ok: 0, error: reason }
  },
}

export default FaceRecognitionAPI
