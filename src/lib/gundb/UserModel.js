// @flow
import type { UserRecord } from '../api'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../validators/isMobilePhone'

type Validation = {
  isValid: boolean,
  errors: {}
}
type ModelValidator = {
  isValid: () => boolean,
  getErrors: () => {},
  validate: () => Validation
}
export type UserModel = UserRecord & ModelValidator

export function getUserModel(record: UserRecord): UserModel {
  const _isValid = errors => Object.keys(errors).every(key => errors[key] === '')

  return {
    ...record,
    isValid: function() {
      const errors = this.getErrors()
      return _isValid(errors)
    },
    getErrors: function() {
      console.log(this, 'getErrors()')

      const emailErrorMessage = isEmail(this.email) ? '' : 'Please enter an email in format: yourname@example.com'
      const mobileErrorMessage = isMobilePhone(this.mobile) ? '' : 'Please enter a valid phone format'

      return { email: emailErrorMessage, mobile: mobileErrorMessage }
    },
    validate: function() {
      return { isValid: this.isValid(), errors: this.getErrors() }
    }
  }
}
