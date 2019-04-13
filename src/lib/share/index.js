// @flow
import fromPairs from 'lodash/fromPairs'
import { decode, encode, isMNID } from 'mnid'
import isURL from 'validator/lib/isURL'

import Config from '../../config/config'

export function generateCode(address: string, networkId: number, amount: number) {
  const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

  return amount > 0 ? `${mnid}|${amount}` : mnid
}

export function readCode(code: string) {
  const [mnid, value] = code.split('|')

  console.log({ code })

  if (!isMNID(mnid)) {
    return null
  }

  const { network, address } = decode(mnid)
  const amount = value && parseInt(value)

  return {
    networkId: parseInt(network),
    address,
    amount: amount ? amount : undefined
  }
}

/**
 * Parses the read ReceiveGDLink from QR Code.
 * If not valid, returns null.
 * If valid, returns the ReceiveGDLink.
 * @param {string} link - receive GD Link
 * @returns {string|null} - {link|null}
 */
export function readReceiveLink(link: string) {
  // checks that the link has the expected strings in it
  const isValidReceiveLink = [Config.publicUrl, 'receiveLink', 'reason'].every(v => link.indexOf(v) !== -1)
  const isUrlOptions = Config.env === 'development' ? { require_tld: false } : {}

  if (!isURL(link, isUrlOptions) || !isValidReceiveLink) {
    return null
  }

  return link
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
    // $FlowFixMe
    .map(p => p.split('='))

  return fromPairs(keyValuePairs)
}
