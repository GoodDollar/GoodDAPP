// @flow
import type { UserRecord } from '../api'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../validators/isMobilePhone'

type Validation = {
  isValid: boolean,
  errors: {}
}
export type ModelValidator = {
  isValid: (key: string) => boolean,
  getErrors: (key: string) => {},
  validate: (key: string) => Validation
}
export type UserModel = UserRecord & ModelValidator

const getEmailErrorMessage = (email?: string) => {
  if (!email) return 'Email is required'
  if (!isEmail(email)) return 'Please enter an email in format: yourname@example.com'

  return ''
}
const getMobileErrorMessage = (mobile?: string) => {
  if (!mobile) return 'Mobile is required'
  if (!isMobilePhone(mobile)) return 'Please enter a valid phone format'

  return ''
}

export const userModelValidations = {
  email: getEmailErrorMessage,
  mobile: getMobileErrorMessage
}

export function getUserModel(record: UserRecord): UserModel {
  const _isValid = errors => Object.keys(errors).every(key => errors[key] === '')

  return {
    ...record,
    isValid: function() {
      const errors = this.getErrors()
      return _isValid(errors)
    },
    getErrors: function() {
      return { email: userModelValidations.email(this.email), mobile: userModelValidations.mobile(this.mobile) }
    },
    validate: function() {
      return { isValid: this.isValid(), errors: this.getErrors() }
    }
  }
}
