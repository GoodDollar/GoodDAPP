import { isError } from 'lodash'

export default exception => {
  let { message } = exception

  // if the json or string http body was thrown from axios (error
  // interceptor in api.js doest that in almost cases) then we're wrapping
  // it onto Error object to keep correct stack trace for Sentry reporting
  if (!isError(exception)) {
    message = exception.error || exception
  }

  if (message) {
    exception.message = message
  }

  return message
}
