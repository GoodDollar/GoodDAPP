/* eslint require-await: "off", lines-around-comment: "off" */
import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { assign, isError, isFunction, isObject, isString, once } from 'lodash'

export const noopAsync = async () => true

export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

export const timeout = async (millis, message = null) =>
  delay(millis).then(() => {
    throw new Error(message)
  })

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

// custom helper implementing the fallback
// strategy over the async functions array
export const fallback = async asyncFns =>
  // calling reduce without initial accumulator
  asyncFns.reduce(async (current, next) => {
    // first argument is the current accumulator
    let promise = current

    // but if no initial accumulator, it will be set
    // to the first array item (e.g. first function)
    // so we're checking the type and if it's a
    // function - calling it and using as accumulator value
    if (isFunction(current)) {
      promise = current()
    }

    // to call the next function if current fails, we're
    // putting it as the .catch(callback)
    // finally, we're returning the promise chained
    return promise.catch(next)
  })

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
