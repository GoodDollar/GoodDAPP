// @flow
import axios, { type Axios } from 'axios'
import { get, isError } from 'lodash'

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

  async wrapApiCall(httpCall) {
    let response

    try {
      const httpResponse = await httpCall

      // our API resolve as usual with response.data
      response = httpResponse.data
    } catch (errorObject) {
      // if API rejects there're 2 possible cases
      // if was rejected with an Error object that means axios exception haven't response.data set
      if (!isError(errorObject)) {
        // in other cases API rejects with response.data we could use
        // and don't forget to set success = false flag
        // it's supposed that GoodServer will return false in the case of non-200 code
        // but let's add this additional safety check
        response = { ...errorObject, success: false }
      }
    }

    const { success, error } = response || {}

    if (!response) {
      // no response - throwing unexpected error
      throw new Error('Failed to perform face verification API call')
    }

    if (!success) {
      // non - success - throwing an exception with failed response
      const exception = new Error(error)

      exception.response = response
      throw exception
    }

    // if success - just return the response
    return response
  }
}

export default new FaceVerificationApi(API, ZoomAPI, logger.child({ from: 'FaceRecognitionAPI' }))
