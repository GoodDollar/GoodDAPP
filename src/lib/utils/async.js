import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { assign, identity, isError, isFunction, isObject, isString, once } from 'lodash'

// eslint-disable-next-line require-await
export const noopAsync = async () => true

// eslint-disable-next-line require-await
export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

// eslint-disable-next-line require-await
export const timeout = async (millis, message = null) =>
  delay(millis).then(() => {
    throw new Error(message)
  })

// eslint-disable-next-line require-await
export const withTimeout = async (asyncFn, timeoutMs = 60000, errorMessage = 'Timed out') =>
  Promise.race([() => asyncFn(), timeout(timeoutMs, errorMessage)])

// eslint-disable-next-line require-await
export const retry = async (asyncFn, retries = 5, interval = 0) =>
  defer(() => fromPromise(asyncFn()))
    .pipe(
      retryWhen(attempts =>
        attempts.pipe(
          mergeMap((attempt, index) => {
            const retryAttempt = index + 1

            if (retryAttempt > retries) {
              return throwError(attempt)
            }

            return timer(interval || 0)
          }),
        ),
      ),
    )
    .toPromise()

// eslint-disable-next-line require-await
export const fallback = async asyncFns =>
  // eslint-disable-next-line require-await
  asyncFns.reduce(async (current, next) => {
    let promise = current

    if (isFunction(current)) {
      promise = current()
    }

    return promise.catch(next)
  })

// eslint-disable-next-line require-await
export const tryUntil = async (asyncFn, condition = identity, retries = 5, interval = 0) => {
  // eslint-disable-next-line require-await
  const completionHandler = async result => {
    if (condition(result)) {
      return result
    }

    throw new Error('tryUntil: not passed, retrying')
  }

  return retry(() => asyncFn().then(completionHandler), retries, interval)
}

// eslint-disable-next-line require-await
export const promisifyGun = async callback =>
  new Promise((resolve, reject) => {
    const onAck = once(ack => {
      const { err } = ack

      // no err - resolve
      if (!err) {
        resolve(ack)
        return
      }

      // if ack.err is an JS error - rejecting with it
      let exception = err

      // otherwise creating a new Error object
      if (!isError(err)) {
        // by default we'll show some generic message
        let message = 'Unexpected GUN error during write / encrypt operation'
        const { code, errno, path, syscall } = err || {}

        // if ack.err is a string we'll use it as the error message
        if (isString(err)) {
          message = err
        } else if (isObject(err) && code && errno) {
          // also err could be an object with { code, errno, syscall, path } shape
          // in this case we'll show the message with errno & code
          message = `GUN error ${errno}: ${code} at ${path}. Syscall: ${syscall}`
        }

        // in other case we'll add some generic message
        exception = new Error(message)
      }

      // attaching ack object reference to the error object
      assign(exception, { ack })
      reject(exception)
    })

    try {
      // some GUN error could be thrown syncronously
      // during .sercet / .decrypt calls, so we'll also
      // wrap the callbeck passed to the try ... catch
      callback(onAck)
    } catch (err) {
      onAck({ err })
    }
  })
