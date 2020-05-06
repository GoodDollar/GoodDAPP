import { extractQueryParams } from '../share'

class DeepLinkingWeb {
  pathname = window.location.pathname

  get params() {
    return extractQueryParams(window.location.href)
  }
}

export default new DeepLinkingWeb()
