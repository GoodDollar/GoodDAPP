import { debounce, isFunction } from 'lodash'

// eslint-disable-next-line require-await
export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

export const onPressFix = cb => debounce(cb, 500, { leading: true, trailing: false })

// eslint-disable-next-line require-await
export const successState = async callbackOrPromise => {
  let promise = callbackOrPromise

  if (isFunction(callbackOrPromise)) {
    promise = callbackOrPromise()
  }

  return promise.then(() => true).catch(() => false)
}
