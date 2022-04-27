// @flow

import { assign, fromPairs } from 'lodash'
import isURL from 'validator/lib/isURL'

import { appUrl } from '../../lib/utils/env'

const isUrlOptions = { require_tld: false }

export const isValidURI = (link: string) => isURL(link, isUrlOptions)

export const createUrlObject = link => {
  if (!link) {
    return {}
  }

  const url = new URL(link)

  const internal = link.startsWith(appUrl)
  const params = fromPairs(url.searchParams.entries())

  assign(url, { internal, params })
  return url
}
