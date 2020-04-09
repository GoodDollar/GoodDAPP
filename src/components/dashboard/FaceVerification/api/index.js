// @flow
import axios from 'axios'
import API from '../../../../lib/API/api'
import logger from '../../../../lib/logger/pino-logger'

import {
  type FaceVerificationResponse,
  type FaceVerificationPayload,
  type FaceVerificationProvider,
  FaceVerificationProviders,
} from './typings'

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
    provider: FaceVerificationProvider = FaceVerificationProviders.Kairos,
    progressSubscription?: ({ loaded: number, total: number }) => void
  ): Promise<FaceVerificationResponse> {
    let imageCount
    let axiosConfig = {}
    const { rootApi, logger } = this

    const { sessionId, images, auditTrailImage, lowQualityAuditTrailImage } = payload

    switch (provider) {
      case FaceVerificationProviders.Kairos:
        imageCount = images.length
        break
      case FaceVerificationProviders.Zoom:
        this.lastCancelToken = axios.CancelToken.source()

        imageCount = Number(!!(auditTrailImage || lowQualityAuditTrailImage))

        axiosConfig = {
          cancelToken: this.lastCancelToken.token,
          onProgress: progressSubscription,
        }
        break
      default:
        throw new Error(`Provider '${provider}' haven't registered.`)
    }

    logger.info('performFaceVerification', { provider, sessionId, imageCount })

    try {
      const { data: response } = await rootApi.performFaceVerification(payload, provider, axiosConfig)
      const { ok, error } = response || {}

      if (!response) {
        throw new Error('Failed to perform face recognition on server')
      }

      if (!ok) {
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
}

export default new FaceVerificationApi(API, logger.child({ from: 'FaceRecognitionAPI' }))
