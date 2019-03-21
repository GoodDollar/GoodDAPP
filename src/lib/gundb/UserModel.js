// @flow
import type { UserRecord } from '../api'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../validators/isMobilePhone'

type ModelValidator = {
  isValid: () => boolean,
  getErrors: () => {}
}

type UserModel = UserRecord & ModelValidator

export function getUserModel(record: UserRecord): UserModel {
  return {
    ...record,
    isValid: function() {
      console.log(this, 'isValid()')
      return this.email && isEmail(this.email) && this.mobile && isMobilePhone(this.mobile)
    },
    getErrors: function() {
      console.log(this, 'getErrors()')

      const emailErrorMessage = isEmail(this.email) ? '' : 'Please enter an email in format: yourname@example.com'
      const mobileErrorMessage = isMobilePhone(this.mobile) ? '' : 'Please enter a valid phone format'

      return { email: emailErrorMessage, mobile: mobileErrorMessage }
    }
  }
}
