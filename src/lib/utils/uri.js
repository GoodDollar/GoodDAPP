// @flow

import { fromPairs } from 'lodash'
import isURL from 'validator/lib/isURL'

const isUrlOptions = { require_tld: false }
const pathNameRegex = /.+?:\/\/.+?(\/.+?)(?:#|\?|$)/

// TODO: migrate to URL
export const extractPathName = url => {
  const [, pathName] = pathNameRegex.exec(url) || []

  return pathName || '/'
}

/**
 * Extracts query params values and returns them as a key-value pair
 * @param {string} link - url with queryParams
 * @returns {object} - {key: value}
 */
export function extractQueryParams(link: string = ''): {} {
  const queryParams = link.split('?')[1] || ''
  const keyValuePairs: Array<[string, string]> = queryParams
    .split('&')
    .filter(_ => _)

    // $FlowFixMe
    .map(p => p.split('='))
    .filter(p => p[0] !== '' && p[0] !== undefined)

  return fromPairs(keyValuePairs)
}

export const isValidURI = (link: string) => isURL(link, isUrlOptions)
