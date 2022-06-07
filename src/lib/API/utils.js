import axios from 'axios'
import { isObject, isString } from 'lodash'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'API' })

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

const responseHandler = ({ data }) => {
  if (data?.ok === 0) {
    log.warn('response error', getErrorMessage(data), data)
    throw new Error(getErrorMessage(data))
  } else {
    return data
  }
}

const exceptionHandler = error => {
  let exception = error

  if (axios.isCancel(error)) {
    exception = new Error('Http request was cancelled during API call')
  }

  const { message, response } = exception
  const { data } = response || {}

  log.warn('axios response error', message, exception)
  throw data || exception
}

export { responseHandler, exceptionHandler }
