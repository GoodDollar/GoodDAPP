import { extractQueryParams } from '../share'

class LinkingWeb {
  pathname = window.location.pathname

  get params() {
    return extractQueryParams(window.location.href)
  }
}

export default new LinkingWeb()
