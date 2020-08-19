// @flow
import axios, { CancelToken } from 'axios'
import { noop, over } from 'lodash'

// eslint-disable-next-line require-await
export const scriptLoaded = async src => {
  const scriptTag = document.querySelector(`script[src*='${src}']`) // eslint-disable-line camelcase
  const scriptSrc = scriptTag.src

  if (!scriptTag) {
    throw new Error(`Couldn't find the script with src includes '${src}'`)
  }

  let onScriptErrorHandler
  let onScriptLoadedHandler
  const { token, cancel } = CancelToken.source()

  return Promise.race([
    new Promise((resolve, reject) => {
      scriptTag.addEventListener('load', (onScriptLoadedHandler = () => over([resolve, cancel])(scriptTag)))
      scriptTag.addEventListener('error', (onScriptErrorHandler = exception => over([reject, cancel])(exception)))
    }),

    axios.get(scriptSrc, { cancelToken: token }).finally(() => {
      scriptTag.removeEventListener('load', onScriptLoadedHandler)
      scriptTag.removeEventListener('error', onScriptErrorHandler)
    }),
  ]).then(noop)
}
