// @flow
import axios from 'axios'
import API from '../../../../lib/API/api'
import logger from '../../../../lib/logger/pino-logger'

import {
  type FaceRecognitionResponse,
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
  ): Promise<FaceRecognitionResponse> {
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
    }

    logger.info('performFaceVerification', { provider, sessionId, imageCount })

    try {
      const { data: response } = await rootApi.performFaceVerification(payload, provider, axiosConfig)

      if (!response) {
        throw new Error('Failed to perform face recognition on server')
      }

      if (!response.ok) {
        throw response
      }

      logger.info('Face Recognition finished successfull', { response })

      return response
    } catch (errorOrFailedResponse) {
      const { message, error } = errorOrFailedResponse

      logger.error('Face recognition failed', error || message, errorOrFailedResponse)
      throw errorOrFailedResponse
    } finally {
      this.lastCancelToken = null
    }
  }

  cancelInFlightRequests() {
    const { lastCancelToken } = this

    if (!lastCancelToken) {
      return
    }

    lastCancelToken.cancel('Face verification has beed reached timeout')
    this.lastCancelToken = null
  }
}

export default new FaceVerificationApi(API, logger.child({ from: 'FaceRecognitionAPI' }))
