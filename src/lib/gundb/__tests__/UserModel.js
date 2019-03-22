// @flow
import { getUserModel } from '../UserModel'

describe('UserModel', () => {
  let validProfile
  beforeEach(() => {
    validProfile = {
      email: 'john@doe.com',
      mobile: '+22222222222'
    }
  })
  it('Valid Profile isValid() should be true', () => {
    const model = getUserModel(validProfile)
    expect(model.isValid()).toBeTruthy()
  })

  it('Invalid Profile isValid() should false', () => {
    validProfile.email = 'fakeemail'
    const model = getUserModel(validProfile)
    expect(model.isValid()).toBeFalsy()
  })

  it('Profile without email isValid() should false', () => {
    delete validProfile.email
    const model = getUserModel(validProfile)
    const { isValid, errors } = model.validate()
    expect(isValid).toBeFalsy()
    expect(errors.email).toBe('Email is required')
  })

  it('Invalid email should get error on email property', () => {
    validProfile.email = 'fakeemail'
    const model = getUserModel(validProfile)
    const errors = model.getErrors()
    expect(errors.mobile).toBe('')
    expect(errors.email).not.toBe('')
  })

  it('validate a valid profile should return an object with valid and no errors', () => {
    const model = getUserModel(validProfile)
    const { isValid, errors } = model.validate()

    expect(isValid).toBeTruthy()
    expect(errors.mobile).toBe('')
    expect(errors.email).toBe('')
  })

  it('validate a inValid profile should return an object with valid in false and errors', () => {
    validProfile.email = 'fake'
    validProfile.mobile = 'fake'

    const model = getUserModel(validProfile)
    const { isValid, errors } = model.validate()

    expect(isValid).toBeFalsy()
    expect(errors.mobile).not.toBe('')
    expect(errors.email).not.toBe('')
  })

  it('isValid only a field', () => {
    const model = getUserModel(validProfile)
    delete model.email

    expect(model.isValid('mobile')).toBeTruthy()
  })

  it('validate should return isValid and errors with only a field', () => {
    const model = getUserModel(validProfile)
    delete model.email
    const { isValid, errors } = model.validate('mobile')
    expect(isValid).toBeTruthy()
    expect(errors.mobile).toBe('')
    expect(errors.email).toBeUndefined()
  })
})
