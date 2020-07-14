// @flow
import { Share } from 'react-native'
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
  counterPartyDisplayName: string,
) {
  const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

  const codeObj = {
    m: mnid,
    a: amount,
    r: reason,
  }
  if (counterPartyDisplayName) {
    codeObj.c = counterPartyDisplayName
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
    const decoded = decodeURIComponent(code)

    try {
      let codeParams = Buffer.from(decoded, 'base64').toString()
      let codeObject = JSON.parse(codeParams)
      mnid = codeObject.mnid || codeObject.m
      amount = codeObject.amount || codeObject.a
      reason = codeObject.reason || codeObject.r
      counterPartyDisplayName = codeObject.counterPartyDisplayName || codeObject.c
    } catch (e) {
      ;[mnid, amount, reason, counterPartyDisplayName] = decoded.split('|')
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
    log.error('readCode failed', e.message, e, { code })

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
 * Generates the standard object required for `navigator.share` method to trigger Share menu on mobile devices
 * @param {string} title
 * @param {string} text
 * @param {string} url - Link
 * @returns {ShareObject}
 */
export function generateShareObject(title: string, message: string, url: string): ShareObject {
  return {
    title,
    message,
    url,
  }
}

export function generateSendShareObject(url: string, amount: number, to: string, from: string): ShareObject {
  return generateShareObject(
    'Sending G$ via GoodDollar App',
    to
      ? `${to}, You've received ${weiToGd(amount)} G$ from ${from}. To withdraw open:`
      : `You've received ${weiToGd(amount)} G$ from ${from}. To withdraw open:`,
    url,
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
    `. To approve transfer open:`,
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

  //remove == of base64 not required then uri encode component to encode +/
  let paramsBase64 = encodeURIComponent(
    Buffer.from(JSON.stringify(params))
      .toString('base64')
      .replace(/==$/, ''),
  )
  let queryParams = ''

  if (Config.enableShortUrl) {
    queryParams = `/${paramsBase64}`
  } else {
    queryParams = action === 'send' ? `?paymentCode=${paramsBase64}` : `?code=${paramsBase64}`
  }

  return encodeURI(`${destination}${queryParams}`)
}

export function shareAction(shareObj, showErrorDialog, customErrorMessage) {
  try {
    Share.share(shareObj)
  } catch (e) {
    if (e.name !== 'AbortError') {
      log.error('Native share failed', e.message, e, {
        shareObj,
        dialogShown: true,
      })

      showErrorDialog(customErrorMessage || 'Sorry, there was an error sharing you link. Please try again later.')
    }
  }
}

export const parsePaymentLinkParams = params => {
  const { paymentCode, reason } = params
  let paymentParams = null

  if (paymentCode) {
    try {
      paymentParams = Buffer.from(decodeURIComponent(paymentCode), 'base64').toString()
      const { p, r, reason: oldr, paymentCode: oldp, i } = JSON.parse(paymentParams)
      paymentParams = {
        paymentCode: p || oldp,
        reason: r || oldr,
        inviteCode: i,
      }
    } catch (e) {
      log.info('uses old format', { paymentCode, reason })
      paymentParams = {
        paymentCode: decodeURIComponent(paymentCode),
        reason: reason ? decodeURIComponent(reason) : null,
      }
    }
  }

  return paymentParams
}
