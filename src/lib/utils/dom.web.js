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

  let unsubscribe
  let unsubscribed = false
  const { token, cancel } = CancelToken.source()

  return Promise.race([
    new Promise((resolve, reject) => {
      unsubscribe = () => {
        if (unsubscribed) {
          return
        }

        unsubscribed = true
        scriptTag.removeEventListener('load', onScriptLoaded)
        scriptTag.removeEventListener('error', onScriptError)
      }

      const onScriptLoaded = () => {
        unsubscribe()
        over([resolve, cancel])(scriptTag)
      }

      const onScriptError = exception => {
        unsubscribe()
        over([reject, cancel])(exception)
      }

      scriptTag.addEventListener('load', onScriptLoaded)
      scriptTag.addEventListener('error', onScriptError)
    }),

    axios.get(scriptSrc, { cancelToken: token }).finally(() => unsubscribe()),
  ]).then(noop)
}
