// @flow
import { sha3 } from 'web3-utils'
import { ExceptionCategory } from '../logger/exceptions'
import logging from '../logger/js-logger'
import { isValidDataUrl } from '../utils/base64'

const logger = logging.child({ from: 'UserProfileUtils' })

export const asLogRecord = profile => {
  if (profile && isValidDataUrl(profile.smallAvatar)) {
    return { ...profile, smallAvatar: '<base64>' }
  }

  return { profile }
}

/**
 * Clean string removing blank spaces and special characters, and converts to lower case
 *
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @returns {string} - Value without '+' (plus), '-' (minus), '_' (underscore), ' ' (space), in lower case
 */
export const cleanHashedFieldForIndex = (field: string, value: string): string => {
  if (value === undefined) {
    return value
  }

  if (field === 'mobile' || field === 'phone') {
    return sha3(value.replace(/[_-\s]+/g, ''))
  }

  return sha3(`${value}`.toLowerCase())
}

/**
 *
 * @param {string} field
 * @param {string} value
 * @returns {boolean}
 */
export const isValidValue = (field: string, value: string) => {
  const cleanValue = cleanHashedFieldForIndex(field, value)

  if (!cleanValue) {
    logger.warn(
      `indexProfileField - field ${field} value is empty (value: ${value})`,
      cleanValue,
      new Error('isValidValue failed'),
      { category: ExceptionCategory.Human },
    )
    return false
  }

  return true
}

const maskPhone = phone => `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`

const maskEmail = email => {
  const [name, domain = ''] = email.split('@')
  const nameLen = name.length

  return `${name[0]}${'*'.repeat(nameLen - 2)}${name[nameLen - 1]}@${domain}`
}

/**
 * Returns phone with last 4 numbers, and before that ***,
 * and hide email user characters leaving visible only first and last character
 * @param {string} fieldType - (Email, mobile or phone) Field name
 * @param {string} value - Field value
 * @returns {string} - Returns masked value with *** to hide characters
 */
export const maskField = (fieldType: 'email' | 'mobile' | 'phone', value: string): string => {
  let masked = value

  if (value) {
    switch (fieldType) {
      case 'mobile':
      case 'phone':
        masked = maskPhone(value)
        break
      case 'email':
        masked = maskEmail(value)
        break
      default:
        break
    }
  }

  return masked
}
