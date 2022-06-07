import axios from 'axios'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'API' })

const responseHandler = ({ data }) => {
  if (data?.ok === 0) {
    log.warn('response error', data?.error, data)
    throw data?.error
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
