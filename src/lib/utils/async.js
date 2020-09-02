import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { assign, isError, isString, once } from 'lodash'

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
      }

      // if ack.err is an JS error - rejecting with it
      let exception = err

      // otherwise creating a new Error object
      if (!isError(err)) {
        // if ack.err is a string we'll use it as the error message
        // in other case we'll add some generic message
        exception = new Error(isString(err) ? err : 'Unexpected error during write / encrypt operation')
      }

      assign(exception, { ack })
      reject(exception)
    })

    callback(onAck)
  })
