// @flow

import isURL from 'validator/lib/isURL'

import { appUrl } from '../../lib/utils/env'

const isUrlOptions = { require_tld: false, require_protocol: true }
const createEmptyUri = () => ({ params: {}, searchParams: new URLSearchParams('') })

class CustomURL extends URL {
  constructor(uri) {
    super(uri)

    const { searchParams } = this

    Object.defineProperties(this, {
      internal: {
        value: uri.startsWith(appUrl),
        writable: false,
        configurable: false,
      },
      params: {
        value: Object.fromEntries(searchParams.entries()),
        writable: false,
        configurable: false,
      },
    })
  }
}

export const isValidURI = (link: string = '') => isURL(link, isUrlOptions)

export const createUrlObject = link => (isValidURI(link) ? new CustomURL(link) : createEmptyUri())
