import axios, { getAdapter } from 'axios'
import { isPlainObject, throttle as throttleCallTo } from 'lodash'

const { adapter: defaultAdaptersList } = axios.defaults

export const throttleAdapter = (throttleInverval, throttleOptions = {}) => {
  const throttled = {
    get: {},
    put: {},
    post: {},
    delete: {},
  }

  // eslint-disable-next-line require-await
  return async config => {
    const defaultAdapter = getAdapter(defaultAdaptersList)
    const { url, method, throttle } = config
    const throttledCalls = throttled[method]

    let callInterval = throttleInverval
    let callOptions = throttleOptions

    if (false === throttle) {
      return defaultAdapter(config)
    }

    if (isPlainObject(throttle)) {
      const { interval, ...options } = throttle

      if (interval) {
        callInterval = interval
      }

      callOptions = options || {}
    }

    if (!(url in throttledCalls)) {
      throttledCalls[url] = throttleCallTo(defaultAdapter, callInterval, callOptions)
    }

    return throttledCalls[url](config)
  }
}
