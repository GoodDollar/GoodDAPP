import { isFunction } from 'lodash'

// eslint-disable-next-line require-await
export const delay = async (millis, resolveWithValue = null) =>
  new Promise(resolve => setTimeout(() => resolve(resolveWithValue), millis))

// eslint-disable-next-line require-await
export const successState = async callbackOrPromise => {
  let promise = callbackOrPromise

  if (isFunction(callbackOrPromise)) {
    promise = callbackOrPromise()
  }

  return promise.then(() => true).catch(() => false)
}
