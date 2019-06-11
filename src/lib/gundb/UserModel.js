// @flow
import type { UserRecord } from '../API/api'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../validators/isMobilePhone'
import isValidUsername from '../validators/isValidUsername'

/**
 * validation object type
 */
type Validation = {
  isValid: boolean,
  errors: {}
}

/**
 * validation interface type
 * @type
 */
export type ModelValidator = {
  isValid: (key: string) => boolean,
  getErrors: (key: string) => {},
  validate: (key: string) => Validation
}

/**
 * User model abstraction useful to validate type and data
 * @type
 */
export type UserModel = UserRecord & ModelValidator

/**
 * Returns email error message after running some validations
 *
 * @param {string} email - email value
 * @returns {string} Email error message if invalid, or empty string
 */
const getEmailErrorMessage = (email?: string) => {
  if (!email) return 'Email is required'
  if (!isEmail(email)) return 'Enter a valid format: yourname@example.com'

  return ''
}

/**
 * Returns mobile error message after running some validations
 *
 * @param {string} mobile - mobile value
 * @returns {string} Mobile error message if invalid, or empty string
 */
const getMobileErrorMessage = (mobile?: string) => {
  if (!mobile) return 'Mobile is required'
  if (!isMobilePhone(mobile)) return 'Please enter a valid phone format'

  return ''
}

const getUsernameErrorMessage = (username: string) => {
  if (!isValidUsername(username)) return 'Must contain only letters (a-z), numbers (0-9) and underscore (_)'

  return ''
}

export const userModelValidations = {
  email: getEmailErrorMessage,
  mobile: getMobileErrorMessage,
  username: getUsernameErrorMessage
}

/**
 * Returns an object with record attributes plus some methods to validate, getErrors and check if it is valid
 *
 * @param {UserRecord} record - User record
 * @returns {UserModel} User model with some available methods
 */
export const getUserModel = (record: UserRecord): UserModel => {
  const _isValid = errors => Object.keys(errors).every(key => errors[key] === '')

  return {
    ...record,
    isValid: function() {
      const errors = this.getErrors()
      return _isValid(errors)
    },
    getErrors: function() {
      return {
        email: userModelValidations.email(this.email),
        mobile: userModelValidations.mobile(this.mobile),
        username: userModelValidations.username(this.username)
      }
    },
    validate: function() {
      return { isValid: this.isValid(), errors: this.getErrors() }
    }
  }
}
