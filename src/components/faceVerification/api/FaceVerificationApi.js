// @flow
import axios from 'axios'
import { assign, get, isError, isObject } from 'lodash'

import API from '../../../lib/API'
import Config from '../../../config/config'
import logger from '../../../lib/logger/js-logger'
import { unexpectedErrorMessage } from '../sdk/FaceTecSDK.constants'

import { hideRedBoxIfNonCritical } from '../utils/redBox'
import { type FaceVerificationPayload, type FaceVerificationResponse } from './typings'

class FaceVerificationApi {
  rootApi: typeof API

  logger: any

  lastCancelToken: any = null

  requestTimeout: any = null

  constructor(config: typeof Config, rootApi: typeof API, logger: any) {
    const { faceVerificationRequestTimeout } = config

    this.logger = logger
    this.rootApi = rootApi
    this.requestTimeout = faceVerificationRequestTimeout
  }

  async getLicense(platform: string): Promise<string> {
    const { rootApi, logger } = this

    try {
      const response = await this.wrapApiCall(rootApi.getLicenseKey(platform))
      const license = get(response, 'license')

      if (!license) {
        throw new Error('FaceTec API response is empty')
      }

      logger.info('Obtained production license:', { license })

      return license
    } catch (exception) {
      const { message } = exception

      logger.error('Failed getting production license:', message, exception)
      throw exception
    }
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

      logger.error('Failed issuing session token:', message, exception)
      throw new Error('Session could not be started due to an unexpected issue during the network request.')
    }
  }

  async performFaceVerification(
    enrollmentIdentifier: string,
    payload: FaceVerificationPayload,
    progressSubscription?: ({ loaded: number, total: number }) => void,
  ): Promise<FaceVerificationResponse> {
    const { rootApi, logger, requestTimeout } = this
    const { sessionId, ...faceScan } = payload
    const lastCancelToken = axios.CancelToken.source()

    const requestPayload = {
      sessionId,
      ...faceScan,
    }

    const axiosConfig = {
      timeout: requestTimeout,
      cancelToken: lastCancelToken.token,
      onUploadProgress: progressSubscription,
    }

    assign(this, { lastCancelToken })
    logger.info('performFaceVerification', { sessionId, enrollmentIdentifier })

    try {
      const response = await this.wrapApiCall(
        rootApi.performFaceVerification(enrollmentIdentifier, requestPayload, axiosConfig),
      )

      logger.info('Face verification finished successfull', { response })

      return response
    } catch (exception) {
      const { message } = exception

      const isError = message.toLowerCase().search('timeout|network') >= 0
      hideRedBoxIfNonCritical(exception, () =>
        logger[isError ? 'error' : 'warn']('Face verification failed', message, exception),
      )
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

  async disposeFaceSnapshot(enrollmentIdentifier: string, fvSigner: string): Promise<void> {
    const { rootApi, logger } = this

    logger.info('Disposing face snapshot', { enrollmentIdentifier })

    try {
      await this.wrapApiCall(rootApi.disposeFaceSnapshot(enrollmentIdentifier, fvSigner))

      logger.info('Face snapshot enqued to disposal queue successfully')
    } catch (exception) {
      const { message } = exception

      logger.error('Face snapshot disposal check failed', message, exception)
      throw exception
    }
  }

  async isFaceSnapshotDisposing(enrollmentIdentifier: string, fvSigner: string): Promise<boolean> {
    const { rootApi, logger } = this

    logger.info('Checking face snapshot disposal state', { enrollmentIdentifier, fvSigner })

    try {
      const { isDisposing } = await this.wrapApiCall(
        rootApi.checkFaceSnapshotDisposalState(enrollmentIdentifier, fvSigner),
      )

      logger.info('Got face snapshot disposal state', { enrollmentIdentifier, fvSigner, isDisposing })
      return isDisposing
    } catch (exception) {
      const { message } = exception

      logger.error('Face snapshot disposal check failed', message, exception)
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
      response = { ...failedResponse, success: false }
    }

    const { success, error } = response || {}

    if (false === success) {
      // non - success - throwing an exception with failed response
      const exception = new Error(error || unexpectedErrorMessage)

      exception.response = response
      throw exception
    }

    // if success - just return the response
    return response
  }
}

export default new FaceVerificationApi(Config, API, logger.child({ from: 'FaceVerificationApi' }))
