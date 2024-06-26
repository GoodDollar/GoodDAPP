/* eslint-disable require-await */
import { lazy } from 'react'
import { defer, from as fromPromise, throwError, timer } from 'rxjs'
import { mergeMap, retryWhen } from 'rxjs/operators'
import { chunk, first, identity, isFunction, last, noop } from 'lodash'

const exportDefault = component => module => ({ default: module[component] })

export const noopAsync = async () => true

export const nodeize =
  functionWithCallback =>
  (...args) => {
    const callback = last(args)
    const newArgs = args.slice(0, -1)

    newArgs.push(result => callback(undefined, result))
    return functionWithCallback(...newArgs)
  }

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

const defaultRetryMiddleware = (rejection, options, defaultOptions) => defaultOptions
const defaultOnFallback = error => true

export const retry = async (asyncFn, retries = 5, interval = 1000, middleware = defaultRetryMiddleware) => {
  const defaultOpts = { retries, interval }
  let opts = { ...defaultOpts }

  return defer(() => fromPromise(asyncFn()))
    .pipe(
      retryWhen(attempts =>
        attempts.pipe(
          mergeMap((attempt, index) => {
            opts = { ...middleware(attempt, opts, defaultOpts) }

            if (index >= opts.retries) {
              return throwError(attempt)
            }

            return timer(opts.interval * index || 0)
          }),
        ),
      ),
    )
    .toPromise()
}

export const fallback = async (asyncFns, onFallback = defaultOnFallback) => {
  if (asyncFns.length < 2) {
    // if no function passed - return undefined
    // if one function passed - immediately return its value
    // because reducer will return fn itself without invocation
    // passiing Promise.resolve as initial accumulator won't help
    // as we're reducing fns only in .catch
    return (first(asyncFns) || noop)()
  }

  return asyncFns.reduce(async (current, next) => {
    let promise = current

    if (isFunction(current)) {
      promise = current()
    }

    // eslint-disable-next-line require-await
    return promise.catch(async error => {
      if (!onFallback(error)) {
        throw error
      }

      return next()
    })
  })
}

export const tryUntil = async (asyncFn, condition = identity, retries = 5, interval = 0) => {
  const completionHandler = async result => {
    if (condition(result)) {
      return result
    }

    throw new Error('tryUntil: not passed, retrying')
  }

  return retry(() => asyncFn().then(completionHandler), retries, interval)
}

export const makePromiseWrapper = () => {
  let resolve
  let reject

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const callback = (error, result) => {
    if (error) {
      reject(error)
    } else {
      resolve(result)
    }
  }

  return { promise, resolve, reject, callback }
}

export const withMutex = async (mutex, action) => {
  const release = await mutex.lock()
  try {
    await action()
  } finally {
    release()
  }
}
