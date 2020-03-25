// @flow
import { CancelToken } from 'axios'
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
    provider: FaceVerificationProvider = FaceVerificationProviders.Kairos
  ): Promise<FaceRecognitionResponse> {
    const { rootApi, logger } = this;
    const { sessionId, images } = payload
    const cancelToken = CancelToken.source();

    this.lastCancelToken = cancelToken;
    logger.info('performFaceVerification', { sessionId, imageCount: images.length })

    try {
      const result = await rootApi.performFaceVerification(
        payload, provider, cancelToken.token
      )

      if (!result) {
        throw new Error('Failed to perform face recognition on server')
      }

      const { ok, error, ...response } = result

      if (!ok) {
        const exception = new Error(error);

        exception.response = response;
        throw exception;
      }

      logger.info('Face Recognition finished successfull', { response })

      return response
    } catch (exception) {
      const { message } = exception

      logger.error('Face recognition failed', message, exception)
      throw exception
    } finally {
      this.lastCancelToken = null
    }
  }

  cancelInFlightRequests(): void {
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
