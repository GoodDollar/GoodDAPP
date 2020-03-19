// @flow
import API from '../../../lib/API/api'
import logger from '../../../lib/logger/pino-logger'

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
 * * performFaceRecognition - calls the server API to perform FR process
 * * onFaceRecognitionResponse - Analyze the server result and call failure / success handler accordingly
 * * onFaceRecognitionSuccess - sets the enrollmentIdentifier (recivied from a successful FR process) on the user private storage
 */
export const FaceRecognitionAPI = {
  async performFaceRecognition(data: CaptureResult) {
    log.info('performFaceRecognition', { sessionId: data.sessionId, imageCount: data.images.length })
    try {
      let res = await API.performFaceRecognition(data)
      return onFaceRecognitionResponse(res.data)
    } catch (e) {
      log.error('General Error in FaceRecognition', e.message, e)
      return { ok: 0, error: 'Failed to perform face recognition on server' }
    }
  },
}
const onFaceRecognitionResponse = (result: FaceRecognitionResponse): FaceRecognitionAPIResponse => {
  log.info({ result })
  if (!result || !result.ok) {
    return onFaceRecognitionFailure(result)
  } else if (result.ok) {
    return onFaceRecognitionSuccess(result)
  }

  log.error('unknown error', { result }) // TODO: handle general error
  onFaceRecognitionFailure(result)

  return { ok: 0, error: 'General Error' }
}

const onFaceRecognitionSuccess = (res: FaceRecognitionResponse) => {
  log.info('Face Recognition finished successfull', { res })
  return { ok: 1, ...res }
}

const onFaceRecognitionFailure = (result: FaceRecognitionResponse) => {
  log.warn('user did not pass Face Recognition', result)
  let reason = ''
  if (!result) {
    reason = 'General Error'
  } else if (result.error) {
    reason = result.error
  }

  //TODO: Rami - should i handle this error as well, or is it on Liav's verification screen
  return { ok: 0, error: reason }
}

export default FaceRecognitionAPI
