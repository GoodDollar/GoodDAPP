import { createUrlObject } from '../utils/uri'

class DeepLinkingWeb {
  pathname = window.location.pathname

  hash = window.location.hash

  query = window.location.search

  get params() {
    const decodedHref = decodeURI(window.location.href)

    return createUrlObject(decodedHref).params
  }
}

export default new DeepLinkingWeb()
