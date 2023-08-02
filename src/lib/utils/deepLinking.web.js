import { createUrlObject } from '../utils/uri'

class DeepLinkingWeb {
  pathname = window.location.pathname

  hash = window.location.hash

  query = window.location.search

  get link() {
    return decodeURI(window.location.href)
  }

  get params() {
    const decodedHref = decodeURI(window.location.href)
    const { params } = createUrlObject(decodedHref)

    return params
  }

  clearQuery() {
    const urlWithoutQuery = this.link.split('?')[0]
    window.history.replaceState({}, '', urlWithoutQuery)
  }
}

export default new DeepLinkingWeb()
