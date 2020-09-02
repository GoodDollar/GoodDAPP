import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { assign, isError, isObject, isString, once } from 'lodash'

// eslint-disable-next-line require-await
export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

export const retry = (asyncFn, retries = 5, interval = 0) =>
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
        const { code, errno } = err || {}

        // if ack.err is a string we'll use it as the error message
        if (isString(err)) {
          message = err
        } else if (isObject(err) && code && errno) {
          // also err could be an object with { code, errno, syscall, path } shape
          // in this case we'll show the message with errno & code
          message = `GUN error ${errno}: ${code}`
        }

        // in other case we'll add some generic message
        exception = new Error(message)
      }

      // attaching ack object reference to the error object
      assign(exception, { ack })
      reject(exception)
    })

    try {
      callback(onAck)
    } catch (err) {
      onAck({ err })
    }
  })
