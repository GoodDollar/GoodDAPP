import axios from 'axios'
import { throttle as throttleCallTo } from 'lodash'

const { adapter } = axios.defaults

export const throttleAdapter = throttleInverval => {
  const throttled = {
    get: {},
    put: {},
    post: {},
    delete: {},
  }

  // eslint-disable-next-line require-await
  return async config => {
    const { url, method, throttle } = config
    const throttledCalls = throttled[method]

    if (false === throttle) {
      return adapter(config)
    }

    if (!(url in throttledCalls)) {
      throttledCalls[url] = throttleCallTo(adapter, throttleInverval)
    }

    return throttledCalls[url](config)
  }
}
