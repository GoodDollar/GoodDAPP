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
  const cancellationManager = CancelToken.source()
  const options = { cancelToken: cancellationManager.token }

  return Promise.race([
    new Promise((_, reject) =>
      scriptTag.addEventListener(
        'error',
        (onScriptErrorHandler = exception => over(reject, cancellationManager.cancel)(exception)),
      ),
    ),

    axios
      .get(scriptSrc, options)
      .then(noop)
      .finally(() => scriptTag.removeEventListener('error', onScriptErrorHandler)),
  ])
}
