// @flow
import { assign, isFunction, mapValues, omitBy, pick } from 'lodash'
import type { UserRecord } from '../API/api'
import isMobilePhone from '../validators/isMobilePhone'
import isValidUsername from '../validators/isValidUsername'
import isEmail from '../validators/isEmail'

/**
 * validation object type
 */
type Validation = {
  isValid: boolean,
  errors: {},
}

/**
 * validation interface type
 * @type
 */
export type ModelValidator = {
  isValid: (key: string) => boolean,
  getErrors: (key: string) => {},
  validate: (key: string) => Validation,
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
  if (!email) {
    return 'Email is required'
  }

  if (!isEmail(email)) {
    return 'Enter a valid format: yourname@example.com'
  }

  return ''
}

/**
 * Returns mobile error message after running some validations
 *
 * @param {string} mobile - mobile value
 * @returns {string} Mobile error message if invalid, or empty string
 */
const getMobileErrorMessage = (mobile?: string) => {
  if (!mobile) {
    return ''
  }

  if (!isMobilePhone(mobile)) {
    return 'Please enter a valid phone format'
  }

  return ''
}

const getUsernameErrorMessage = (username: string) => {
  if (username === '') {
    return 'Username cannot be empty'
  }
  if (!isNaN(username) || !isValidUsername(username)) {
    return 'Only letters, numbers and underscore'
  }

  return ''
}

export const getUserRecord = userModel => omitBy(userModel, isFunction)

export const userModelValidations = {
  email: getEmailErrorMessage,
  mobile: getMobileErrorMessage,
  username: getUsernameErrorMessage,
}

export class UserModelClass {
  constructor(userRecord) {
    assign(this, userRecord)
  }

  isValid(update: boolean = false) {
    const errors = this.getErrors(update)

    return this._isValid(errors)
  }

  update(fields: UserRecord): UserModel {
    const updatedFields = {
      ...getUserRecord(this),
      ...fields,
    }

    return new UserModelClass(updatedFields)
  }

  validate(update: boolean = false) {
    const errors = this.getErrors(update)

    return { isValid: this._isValid(errors), errors }
  }

  getErrors(update: boolean = false) {
    const fieldsToValidate = pick(this, 'email', 'mobile', 'username')

    // eslint-disable-next-line
    return mapValues(fieldsToValidate, (value, field) =>
      false === update || value ? userModelValidations[field](value) : '',
    )
  }

  _isValid(errors) {
    return Object.keys(errors).every(key => errors[key] === '')
  }
}

/**
 * Returns an object with record attributes plus some methods to validate, getErrors and check if it is valid
 *
 * @param {UserRecord} record - User record
 * @returns {UserModel} User model with some available methods
 */
export const getUserModel = (record: UserRecord): UserModel => new UserModelClass(record)
