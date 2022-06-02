/* eslint-disable require-await */
import { lazy } from 'react'
import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { assign, chunk, first, identity, isError, isFunction, isObject, isString, once } from 'lodash'

const exportDefault = component => module => ({ default: module[component] })

export const noopAsync = async () => true

export const lazyExport = (dynamicImport, ...exportComponents) => {
  const [hocFn, ...rest] = exportComponents
  const withCustomHoc = isFunction(hocFn)
  const hoc = withCustomHoc ? hocFn : lazy
  const components = withCustomHoc ? rest : exportComponents

  return components.map(component => hoc(() => dynamicImport().then(exportDefault(component))))
}

export const batch = async (items, chunkSize, onItem) =>
  chunk(items, chunkSize).reduce(
    async (promise, itemsChunk) =>
      promise.then(async results => {
        const chunkResults = await Promise.all(itemsChunk.map(onItem))

        return results.concat(chunkResults)
      }),
    Promise.resolve([]),
  )

export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

export const timeout = async (millis, message = null) =>
  delay(millis).then(() => {
    throw new Error(message)
  })

export const withDelay = async (asyncFn, millis) => Promise.all([asyncFn, delay(millis)]).then(first)

export const withTimeout = async (asyncFn, timeoutMs = 60000, errorMessage = 'Timed out') =>
  Promise.race([asyncFn(), timeout(timeoutMs, errorMessage)])

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

export const fallback = async asyncFns =>
  asyncFns.reduce(async (current, next) => {
    let promise = current

    if (isFunction(current)) {
      promise = current()
    }

    return promise.catch(next)
  })

export const tryUntil = async (asyncFn, condition = identity, retries = 5, interval = 0) => {
  const completionHandler = async result => {
    if (condition(result)) {
      return result
    }

    throw new Error('tryUntil: not passed, retrying')
  }

  return retry(() => asyncFn().then(completionHandler), retries, interval)
}

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
