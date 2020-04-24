// @flow
import { fromPairs, isEmpty } from 'lodash'
import { decode, encode, isMNID } from 'mnid'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import isMobilePhone from '../validators/isMobilePhone'
import { weiToGd } from '../wallet/utils'

const log = logger.child({ from: 'share.index' })

/**
 * Generates a code contaning an MNID with an amount if specified
 * @param address - address required to generate MNID
 * @param networkId - network identifier required to generate MNID
 * @param amount - amount to be attached to the generated MNID code
 * @param reason - reason to be attached to the generated MNID code
 * @param counterPartyDisplayName
 * @returns {string} - 'MNID|amount'|'MNID'
 */
export function generateCode(
  address: string,
  networkId: number,
  amount: number,
  reason: string,
  counterPartyDisplayName: string
) {
  const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

  const codeObj = {
    mnid,
    amount,
    reason,
  }
  if (counterPartyDisplayName) {
    codeObj.counterPartyDisplayName = counterPartyDisplayName
  }

  return codeObj
}

/**
 * Extracts the information from the generated code in `generateCode`
 * @param code - code returned by `generateCode`
 * @returns {null|{amount: *, address, networkId: number, reason: string}}
 */
export function readCode(code: string) {
  try {
    let mnid, amount, reason, counterPartyDisplayName
    try {
      let codeParams = Buffer.from(code, 'base64').toString()
      let codeObject = JSON.parse(codeParams)
      mnid = codeObject.mnid
      amount = codeObject.amount
      reason = codeObject.reason
      counterPartyDisplayName = codeObject.counterPartyDisplayName
    } catch (e) {
      ;[mnid, amount, reason, counterPartyDisplayName] = code.split('|')
    }

    if (!isMNID(mnid)) {
      return null
    }

    const { network, address } = decode(mnid)
    amount = amount && parseInt(amount)
    reason = reason === 'undefined' ? undefined : reason
    counterPartyDisplayName = counterPartyDisplayName === 'undefined' ? undefined : counterPartyDisplayName
    return {
      networkId: parseInt(network),
      address,
      amount: amount ? amount : undefined,
      reason,
      counterPartyDisplayName,
    }
  } catch (e) {
    log.error('readCode failed', e.message, e)
    return null
  }
}

/**
 * Parses the read ReceiveGDLink from QR Code.
 * If not valid, returns null.
 * If valid, returns the ReceiveGDLink.
 * @param {string} link - receive G$ Link
 * @returns {string|null} - {link|null}
 */
export function readReceiveLink(link: string) {
  // checks that the link has the expected strings in it
  const isValidReceiveLink = ['receiveLink', 'reason'].every(v => link.indexOf(v) !== -1)
  const isUrlOptions = { require_tld: false }

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
    .filter(_ => _)

    // $FlowFixMe
    .map(p => p.split('='))
    .filter(p => p[0] !== '' && p[0] !== undefined)
  return fromPairs(keyValuePairs)
}

type ShareObject = {
  title: string,
  text: string,
  url: string,
}

/**
 * Generates the standard object required for `Share.share` method to trigger Share menu on mobile devices
 * @param {string} title
 * @param {string} message
 * @param {string} url - Link
 * @returns {ShareObject}
 */
export function generateShareObject(title: string, message: string, url: string): ShareObject {
  return {
    title,
    message: `${message} ${url}`,
  }
}

export function generateSendShareObject(url: string, amount: number, to: string, from: string): ShareObject {
  return generateShareObject(
    'Sending G$ via GoodDollar App',
    to
      ? `${to}, You've received ${weiToGd(amount)} G$ from ${from}. To withdraw open:`
      : `You've received ${weiToGd(amount)} G$ from ${from}. To withdraw open:`,
    url
  )
}

export function generateSendShareText(...args): ShareObject {
  const temp = generateSendShareObject(...args)
  return `${temp.message} ${temp.url}`
}

/**
 * Generates URL link to share/receive GDs
 * @param {any} codeObj - code returned by `generateCode`
 * @param {number } amount - amount expressed in Wei
 * @param {string} to - recipient name
 * @param {string} from - current user's fullName
 * @returns {string} - URL to use to share/receive GDs
 */
export function generateReceiveShareObject(codeObj: any, amount: number, to: string, from: string): ShareObject {
  const url = generateShareLink('receive', codeObj)
  const text = [
    to ? `${to}, ` : '',
    `You've got a request from ${from}`,
    amount > 0 ? ` for ${weiToGd(amount)} G$` : '',
    `. To Transfer open:`,
  ].join('')

  return generateShareObject('Sending G$ via GoodDollar App', text, url)
}

export function generateReceiveShareText(...args): ShareObject {
  const temp = generateReceiveShareObject(...args)
  return `${temp.message} ${temp.url}`
}

type HrefLinkProps = {
  link: string,
  description: string,
}

/**
 * Generates the links to share via anchor tag
 * @param {string} to - Email address or phone number
 * @param {string} sendLink - Link
 * @returns {HrefLinkProps[]}
 */
export function generateHrefLink(shareObject: ShareObject, to?: string = ''): HrefLinkProps {
  const { title, text, url } = shareObject
  const body = `${text}\n${url}`
  if (isEmail(to)) {
    return { link: `mailto:${to}?subject=${title}&body=${body}`, description: 'e-mail' }
  }

  if (isMobilePhone(to)) {
    return { link: `sms:${to}?body=${body}`, description: 'sms' }
  }

  return undefined
}

type ActionType = 'receive' | 'send'

/**
 * Generates URL link to share/receive GDs
 * @param {ActionType} action - Wether 'receive' or 'send'
 * @param {object} params - key-pair of query params to be added to the URL
 * @returns {string} - URL to use to share/receive GDs
 */
export function generateShareLink(action: ActionType = 'receive', params: {} = {}): string {
  // depending on the action, routes may vary
  const destination = {
    receive: Config.receiveUrl,
    send: Config.sendUrl,
  }[action]

  if (!destination || isEmpty(params)) {
    throw new Error(`Link couldn't be generated`)
  }

  let paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64')
  let queryParams = ''

  if (Config.network === 'production') {
    queryParams = `/${paramsBase64}`
  } else {
    queryParams = action === 'send' ? `?paymentCode=${paramsBase64}` : `?code=${paramsBase64}`
  }

  return encodeURI(`${destination}${queryParams}`)
}
