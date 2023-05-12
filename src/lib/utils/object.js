import { isBoolean, isNaN, isNull, isNumber, isString, isUndefined } from 'lodash'

const get = Object.getOwnPropertyDescriptor
const isNil = value => value === void 0 || value === null

export const isScalar = value =>
  [isNull, isUndefined, isString, isNumber, isBoolean, isNaN].some(checker => checker(value))

export const propertyDescriptor = (value, property) => {
  let desc

  if (isNil(value)) {
    return null
  }

  desc = get(value, property)
  return desc === void 0 ? null : desc
}
