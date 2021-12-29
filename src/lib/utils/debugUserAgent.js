import { noop } from 'lodash'

import Config from '../../config/config'
;(() => {
  const { env, debugUserAgent } = Config

  if ('production' === env || !debugUserAgent) {
    return
  }

  const request = new XMLHttpRequest()

  request.onreadystatechange = noop
  request.open('GET', debugUserAgent)
  request.send()

  fetch(debugUserAgent).catch(noop)
})()
