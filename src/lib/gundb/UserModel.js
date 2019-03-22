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

export const getEmailErrorMessage = (email?: string) => {
  if (!email) return 'Email is required'
  if (!isEmail(email)) return 'Please enter an email in format: yourname@example.com'

  return ''
}
export const getMobileErrorMessage = (mobile?: string) => {
  if (!mobile) return 'Mobile is required'
  if (!isMobilePhone(mobile)) return 'Please enter a valid phone format'

  return ''
}

export function getUserModel(record: UserRecord): UserModel {
  const _isValid = errors => Object.keys(errors).every(key => errors[key] === '')

  const validations = {
    email: getEmailErrorMessage,
    mobile: getMobileErrorMessage
  }

  return {
    ...record,
    isValid: function(key) {
      const errors = this.getErrors(key)
      return _isValid(errors)
    },
    getErrors: function(key) {
      if (key) return { [key]: validations[key](this[key]) }

      return { email: validations.email(this.email), mobile: validations.mobile(this.mobile) }
    },
    validate: function(key) {
      return { isValid: this.isValid(key), errors: this.getErrors(key) }
    }
  }
}
