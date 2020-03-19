// @flow
import API from '../../../lib/API/api'
import logger from '../../../lib/logger/pino-logger'

export type FaceRecognitionResponse = {
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

export async function performFaceRecognition(payload: CaptureResult): FaceRecognitionAPIResponse {
  const { sessionId, images } = payload

  log.info('performFaceRecognition', { sessionId, imageCount: images.length })

  try {
    const result = await API.performFaceRecognition(payload)

    if (!result) {
      throw new Error('Failed to perform face recognition on server')
    }

    const { ok, error, ...response } = result

    if (!ok) {
      throw new Error(error)
    }

    log.info('Face Recognition finished successfull', { response })

    return { success: true, ...response }
  } catch (exception) {
    const { message } = exception

    log.error('Face recognition failed', message, exception)
    return { success: false, error: message }
  }
}
