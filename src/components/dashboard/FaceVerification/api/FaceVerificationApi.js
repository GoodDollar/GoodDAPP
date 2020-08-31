// @flow
import axios, { type Axios } from 'axios'
import { get, isError, isObject } from 'lodash'

import API from '../../../../lib/API/api'
import logger from '../../../../lib/logger/pino-logger'

import { type FaceVerificationPayload, type FaceVerificationResponse } from './typings'

class FaceVerificationApi {
  rootApi: typeof API

  zoomApi: Axios

  logger: any

  lastCancelToken: any = null

  constructor(rootApi: typeof API, logger: any) {
    this.rootApi = rootApi
    this.logger = logger
  }

  async issueSessionToken(): Promise<string> {
    const { rootApi, logger } = this

    try {
      const issuerResponse = await this.wrapApiCall(rootApi.issueSessionToken())
      const sessionId = get(issuerResponse, 'sessionToken')

      if (!sessionId) {
        throw new Error('FaceTec API response is empty')
      }

      logger.info('Session token was issued', { sessionId })

      return sessionId
    } catch (exception) {
      const { message } = exception

      logger.error('Session session token issue failed:', message, exception)
      throw new Error('Session could not be started due to an unexpected issue during the network request.')
    }
  }

  async performFaceVerification(
    payload: FaceVerificationPayload,
    progressSubscription?: ({ loaded: number, total: number }) => void,
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

      logger.info('Got face snapshot disposal state', { enrollmentIdentifier, isDisposing })
      return isDisposing
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
      if (isError(errorObject)) {
        throw errorObject
      }

      // in other cases API rejects with response.data we could use
      let failedResponse = errorObject

      // if response.data wasn't an object, using it's value as the error message string
      if (!isObject(failedResponse)) {
        failedResponse = { error: String(failedResponse) }
      }

      // don't forget to set success = false flag
      // it's supposed that GoodServer will return false in the case of non-200 code
      // but let's add this additional safety check
      response = { ...errorObject, success: false }
    }

    const { success, error } = response || {}

    if (false === success) {
      // non - success - throwing an exception with failed response
      const exception = new Error(error)

      exception.response = response
      throw exception
    }

    // if success - just return the response
    return response
  }
}

export default new FaceVerificationApi(API, logger.child({ from: 'FaceRecognitionAPI' }))
