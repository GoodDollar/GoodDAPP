// @flow

import { decode as atob, encode as btoa } from 'base-64'
import { isString } from 'lodash'
import isURL from 'validator/lib/isURL'

import { appUrl } from '../../lib/utils/env'
import { tryJson } from './string'

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

export const decodeBase64Params = value => tryJson(atob(decodeURIComponent(value)))

export const encodeBase64Params = value => encodeURIComponent(btoa(isString(value) ? value : JSON.stringify(value)))
