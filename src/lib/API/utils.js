// @flow

import axios from 'axios'
import { assign, isError, isObject, isPlainObject, isString } from 'lodash'

import logger from '../logger/js-logger'

import type { NameRecord } from '../../components/signup/NameForm'
import type { EmailRecord } from '../../components/signup/EmailForm'
import type { MobileRecord } from '../../components/signup/PhoneForm'

export type Credentials = {
  signature?: string, //signed with address used to login to the system
  gdSignature?: string, //signed with address of user wallet holding G$
  profileSignature?: string, //signed with address of user profile
  profilePublickey?: string, //public key used for storing user profile
  nonce?: string,
  jwt?: string,
}

export type UserRecord = NameRecord &
  EmailRecord &
  MobileRecord &
  Credentials & {
    username?: string,
  }

export const log = logger.child({ from: 'API' })
export const defaultErrorMessage = 'Unexpected error happened during api call'

export const getErrorMessage = apiError => {
  let errorMessage

  if (isString(apiError)) {
    errorMessage = apiError
  } else if (isObject(apiError)) {
    // checking all cases:
    // a) JS Error - will have .message property
    // b) { ok: 0, message: 'Error message' } shape
    // c) { ok: 0, error: 'Error message' } shape
    const { message, error } = apiError

    errorMessage = message || error
  }

  if (!errorMessage) {
    errorMessage = defaultErrorMessage
  }

  return errorMessage
}

export const getException = apiError => {
  let exception = apiError

  if (!isError(apiError)) {
    const message = getErrorMessage(apiError)

    exception = new Error(message)
  }

  return exception
}

export const throwException = apiError => {
  const exception = getException(apiError)

  throw exception
}

export const requestErrorHandler = exception => {
  const { message } = exception

  // Do something with request error
  log.warn('axios req error', message, exception)
  throw exception
}

export const responseHandler = response => {
  const { data } = response

  if (isPlainObject(data) && 'ok' in data && !data.ok) {
    const message = getErrorMessage(data)
    const exception = new Error(message)

    assign(exception, { response })
    log.warn('server response error', message, exception)

    throw exception
  }

  return response
}

export const responseErrorHandler = error => {
  let exception = error

  if (axios.isCancel(error)) {
    exception = new Error('Http request was cancelled during API call')
  }

  const { message, response } = exception
  const { data } = response || {}

  log.warn('axios response error', message, exception)
  throw data || exception
}
