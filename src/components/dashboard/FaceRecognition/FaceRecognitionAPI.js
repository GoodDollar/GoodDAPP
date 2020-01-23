// @flow
import API from '../../../lib/API/api'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'

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
type CaptureResult = { sessionId: String, images: Array<any> }

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
  async performFaceRecognition(data: CaptureResult) {
    log.info('performFaceRecognition', { sessionId: data.sessionId, imageCount: data.images.length })
    let req = this.createFaceRecognitionReq(data)
    try {
      let res = await API.performFaceRecognition(req)
      return this.onFaceRecognitionResponse(res.data)
    } catch (e) {
      log.error('General Error in FaceRecognition', e.message, e)
      return { ok: 0, error: 'Failed to perform face recognition on server' }
    }
  },

  createFaceRecognitionReq(data: CaptureResult) {
    let req = new FormData()
    req.append('sessionId', data.sessionId)
    data.images.forEach(img => req.append('images', Buffer.from(img.base64, 'base64'), { contentType: 'image/jpeg' }))
    let account = goodWallet.getAccountForType('zoomId')
    req.append('enrollmentIdentifier', account)
    return req
  },

  onFaceRecognitionResponse(result: FaceRecognitionResponse): FaceRecognitionAPIResponse {
    log.info({ result })
    if (!result || !result.ok) {
      return this.onFaceRecognitionFailure(result)
    } else if (result.ok) {
      return this.onFaceRecognitionSuccess(result)
    }

    log.error('unknown error', { result }) // TODO: handle general error
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
