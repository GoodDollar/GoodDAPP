// @flow
import axios from 'axios'
import API from '../../../../lib/API/api'
import logger from '../../../../lib/logger/pino-logger'
import { type FaceVerificationPayload, type FaceVerificationResponse } from './typings'

class FaceVerificationApi {
  rootApi: typeof API

  logger: any

  lastCancelToken: any = null

  constructor(rootApi: typeof API, logger: any) {
    this.rootApi = rootApi
    this.logger = logger
  }

  async performFaceVerification(
    payload: FaceVerificationPayload,
    progressSubscription?: ({ loaded: number, total: number }) => void
  ): Promise<FaceVerificationResponse> {
    let axiosConfig = {}
    const { rootApi, logger } = this

    const { sessionId, enrollmentIdentifier } = payload

    this.lastCancelToken = axios.CancelToken.source()

    axiosConfig = {
      cancelToken: this.lastCancelToken.token,
      onProgress: progressSubscription,
    }

    logger.info('performFaceVerification', { sessionId, enrollmentIdentifier })

    try {
      const { data: response } = await rootApi.performFaceVerification(payload, axiosConfig)
      const { success, error } = response || {}

      if (!response) {
        throw new Error('Failed to perform face recognition on server')
      }

      if (!success) {
        const exception = new Error(error)

        exception.response = response
        throw exception
      }

      logger.info('Face Recognition finished successfull', { response })

      return response
    } catch (exception) {
      const { message, response } = exception
      const { error } = response || {}

      logger.error('Face recognition failed', error || message, exception)
      throw exception
    } finally {
      this.lastCancelToken = null
    }
  }

  cancelInFlightRequests() {
    const { lastCancelToken } = this

    if (!lastCancelToken) {
      return
    }

    lastCancelToken.cancel('Face verification timeout')
    this.lastCancelToken = null
  }

  async disposeFaceSnapshot(enrollmentIdentifier: string, signature: string): Promise<void> {
    await this.rootApi.disposeFaceSnapshot(enrollmentIdentifier, signature)
  }
}

export default new FaceVerificationApi(API, logger.child({ from: 'FaceRecognitionAPI' }))
