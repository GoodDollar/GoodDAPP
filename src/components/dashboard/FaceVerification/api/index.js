// @flow
import axios from 'axios'
import API from '../../../../lib/API/api'
import logger from '../../../../lib/logger/pino-logger'

import {
  type FaceRecognitionResponse,
  type FaceVerificationPayload,
  type FaceVerificationProvider,
  FaceVerificationProviders
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
    const { rootApi, logger } = this
    const tokenSource = axios.CancelToken.source()
    const axiosConfig = { cancelToken: tokenSource.token }
    const { sessionId, images, auditTrailImage, lowQualityAuditTrailImage } = payload

    let imageCount;

    switch (provider) {
      case FaceVerificationProviders.Kairos:
        imageCount = images.length
        break;
      case FaceVerificationProviders.Zoom:
        imageCount = Number(!!(auditTrailImage || lowQualityAuditTrailImage))
        break;
      default:
    }

    this.lastCancelToken = tokenSource
    logger.info('performFaceVerification', { provider, sessionId, imageCount })

    if (progressSubscription) {
      axiosConfig.onProgress = progressSubscription
    }

    try {
      const { data: response } = await rootApi.performFaceVerification(
        payload, provider, axiosConfig
      );

      const { ok, error } = response || {}

      if (!response) {
        throw new Error('Failed to perform face recognition on server')
      }

      if (!ok) {
        throw response;
      }

      logger.info('Face Recognition finished successfull', { response })

      return data
    } catch (errorOrFailedResponse) {
      const { message, error } = errorOrFailedResponse

      logger.error('Face recognition failed', error || message, errorOrFailedResponse)
      throw errorOrFailedResponse
    } finally {
      this.lastCancelToken = null
    }
  }

  cancelInFlightRequests() {
    const { lastCancelToken } = this;

    if (!lastCancelToken) {
      return
    }

    lastCancelToken.cancel('Face verification has beed reached timeout');
    this.lastCancelToken = null;
  }
}

export default new FaceVerificationApi(
  API,
  logger.child({ from: 'FaceRecognitionAPI' })
);
