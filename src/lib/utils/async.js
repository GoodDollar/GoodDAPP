import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retry as retryTimes, retryWhen } from 'rxjs/operators'

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

            return interval > 0 ? timer(interval) : retryTimes(1)
          }),
        ),
      ),
    )
    .toPromise()
