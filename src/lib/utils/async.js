import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { assign, once } from 'lodash'

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

      if (!err) {
        resolve(ack)
      }

      const exception = new Error(err)

      assign(exception, { ack })
      reject(exception)
    })

    callback(onAck)
  })
