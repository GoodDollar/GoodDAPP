// @flow

import { fromPairs } from 'lodash'
import isURL from 'validator/lib/isURL'

import { appUrl } from '../../lib/utils/env'

const isUrlOptions = { require_tld: false }
const emptyUri = { params: {}, searchParams: new URLSearchParams('') }

export const isValidURI = (link: string) => isURL(link, isUrlOptions)

export const createUrlObject = link =>
  !isValidURI(link)
    ? emptyUri
    : new class extends URL {
        constructor(uri) {
          super(uri)

          const { searchParams } = this

          Object.defineProperties(this, {
            internal: {
              value: link.startsWith(appUrl),
              writable: false,
              configurable: false,
            },
            params: {
              value: fromPairs(searchParams.entries()),
              writable: false,
              configurable: false,
            },
          })
        }
      }(link)
