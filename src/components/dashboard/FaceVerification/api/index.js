// @flow
import axios from 'axios'
import API from '../../../../lib/API/api'
import logger from '../../../../lib/logger/pino-logger'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import { type FaceVerificationPayload, type FaceVerificationResponse } from './typings'

class FaceVerificationApi {
  rootApi: typeof API

  logger: any

  lastCancelToken: any = null

  /**
   * wallet an instance of GoodWallet
   * @instance {GoodWallet}
   */
  wallet: GoodWallet

  constructor(rootApi: typeof API, wallet: GoodWallet, logger: any) {
    this.rootApi = rootApi
    this.logger = logger
    this.wallet = wallet
  }

  async performFaceVerification(
    payload: FaceVerificationPayload,
    enrollmentIdentifier: string,
    progressSubscription?: ({ loaded: number, total: number }) => void
  ): Promise<FaceVerificationResponse> {
    let axiosConfig = {}
    const { rootApi, logger } = this

    const { sessionId } = payload

    this.lastCancelToken = axios.CancelToken.source()

    axiosConfig = {
      cancelToken: this.lastCancelToken.token,
      onProgress: progressSubscription,
    }

    logger.info('performFaceVerification', { sessionId })

    try {
      const { data: response } = await rootApi.performFaceVerification(payload, enrollmentIdentifier, axiosConfig)
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

  async disposeFaceSnapshot(enrollmentIdentifier, signature): Promise<void> {
    await this.rootApi.disposeFaceSnapshot(enrollmentIdentifier, signature)
  }
}

export default new FaceVerificationApi(API, goodWallet, logger.child({ from: 'FaceRecognitionAPI' }))
