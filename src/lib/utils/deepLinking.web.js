import { extractQueryParams } from '../share'

class DeepLinkingWeb {
  pathname = window.location.pathname

  hash = window.location.hash

  get params() {
    const decodedHref = decodeURI(window.location.href)
    return extractQueryParams(decodedHref)
  }
}

export default new DeepLinkingWeb()
