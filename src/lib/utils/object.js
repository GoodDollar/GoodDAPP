const get = Object.getOwnPropertyDescriptor
const isNil = value => value === void 0 || value === null

export const propertyDescriptor = (value, property) => {
  let desc

  if (isNil(value)) {
    return null
  }

  desc = get(value, property)
  return desc === void 0 ? null : desc
}
