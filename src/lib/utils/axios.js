import axios from 'axios'
import { throttle } from 'lodash'

export const throttleAdapter = throttleInverval => {
  const throttled = {
    get: {},
    put: {},
    post: {},
    delete: {},
  }

  // eslint-disable-next-line require-await
  return async config => {
    const { url, method } = config
    const throttledCalls = throttled[method]

    if (!(url in throttledCalls)) {
      throttledCalls[url] = throttle(axios.defaults.adapter, throttleInverval)
    }

    return throttledCalls[url](config)
  }
}
