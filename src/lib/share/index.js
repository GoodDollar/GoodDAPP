// @flow
import fromPairs from 'lodash/fromPairs'
import { decode, encode, isMNID } from 'mnid'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'

import Config from '../../config/config'
import isMobilePhone from '../validators/isMobilePhone'

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

type HrefLinkProps = {
  link: string,
  description: string
}

/**
 * Generates the links to share via anchor tag
 * @param {string} to - Email address or phone number
 * @param {string} sendLink - Link
 * @returns {HrefLinkProps[]}
 */
export function generateHrefLinks(sendLink: string, to?: string = ''): Array<HrefLinkProps> {
  const text = `You got GD. To withdraw open: ${sendLink}`
  const viaEmail = { link: `mailto:${to}?subject=Sending GD via Good Dollar App&body=${text}`, description: 'e-mail' }
  const viaSMS = { link: `sms:${to}?body=${text}`, description: 'sms' }

  if (isEmail(to)) {
    return [viaEmail]
  }

  if (isMobilePhone(to)) {
    return [viaSMS]
  }

  return [viaEmail, viaSMS]
}
