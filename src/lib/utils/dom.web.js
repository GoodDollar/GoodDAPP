// @flow
import { get } from 'lodash'

// eslint-disable-next-line require-await
export const isScriptFailed = src => {
  const scriptTag = document.querySelector(`script[src*='${src}']`)

  if (!scriptTag) {
    return true
  }

  const scriptSrc = scriptTag.src
  const failedScripts = get(window, '__failed_scripts', {})

  if (scriptSrc in failedScripts) {
    return failedScripts[scriptSrc]
  }

  return false
}
