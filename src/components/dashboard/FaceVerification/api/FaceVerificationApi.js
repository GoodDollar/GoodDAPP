// @flow
import axios, { type Axios } from 'axios'
import { get } from 'lodash'

import API from '../../../../lib/API/api'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

import { type FaceVerificationPayload, type FaceVerificationResponse } from './typings'

const ZoomAPI = axios.create({
  baseURL: Config.zoomServerURL,
  headers: {
    'X-Device-License-Key': Config.zoomLicenseKey,
  },
})

ZoomAPI.interceptors.response.use(({ data }) => data)

class FaceVerificationApi {
  rootApi: typeof API

  zoomApi: Axios

  logger: any

  lastCancelToken: any = null

  constructor(rootApi: typeof API, zoomApi: Axios, logger: any) {
    this.rootApi = rootApi
    this.zoomApi = zoomApi
    this.logger = logger
  }

  async issueSessionToken(): Promise<string> {
    try {
      const issuerResponse = await this.zoomApi.get('/session-token')
      const sessionId = get(issuerResponse, 'data.sessionToken')

      if (!sessionId) {
        throw new Error('FaceTec API response is empty')
      }

      logger.info('Session token was issued', { sessionId })

      return sessionId
    } catch (exception) {
      const { message } = exception

      logger.error('Session session token issue failed: ', message, exception)
      throw new Error('Session could not be started due to an unexpected issue during the network request.')
    }
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
      onUploadProgress: progressSubscription,
    }

    logger.info('performFaceVerification', { sessionId, enrollmentIdentifier })

    try {
      const response = await this.wrapApiCall(rootApi.performFaceVerification(payload, axiosConfig))

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
    const { rootApi } = this

    logger.info('Disposing face snapshot', { enrollmentIdentifier })

    try {
      await this.wrapApiCall(rootApi.disposeFaceSnapshot(enrollmentIdentifier, signature))

      logger.info('Face snapshot enqued to disposal queue successfully')
    } catch (exception) {
      const { message, response } = exception
      const { error } = response || {}

      logger.error('Face snapshot disposal check failed', error || message, exception)
      throw exception
    }
  }

  async isFaceSnapshotDisposing(enrollmentIdentifier: string): Promise<boolean> {
    const { rootApi, logger } = this

    logger.info('Checking face snapshot disposal state', { enrollmentIdentifier })

    try {
      const { isDisposing } = await this.wrapApiCall(rootApi.checkFaceSnapshotDisposalState(enrollmentIdentifier))

      logger.info('Got face snapshot disposal stage', { enrollmentIdentifier, isDisposing })
      return isDisposing
    } catch (exception) {
      const { message, response } = exception
      const { error } = response || {}

      logger.error('Face snapshot disposal check failed', error || message, exception)
      throw exception
    }
  }

  async wrapApiCall(httpCall) {
    const { data: response } = await httpCall
    const { success, error } = response || {}

    if (!response) {
      throw new Error('Failed to perform face verification API call')
    }

    if (!success) {
      const exception = new Error(error)

      exception.response = response
      throw exception
    }

    return response
  }
}

export default new FaceVerificationApi(API, ZoomAPI, logger.child({ from: 'FaceRecognitionAPI' }))
