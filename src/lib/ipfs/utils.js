import { isString } from 'lodash'

const cidRegexp = /^[\w\d]+$/i

// checks is string a valid CID. it should be at least 40 chars length and contrain only letters & numbers
export const isValidCID = source => isString(source) && source.length >= 40 && cidRegexp.test(source)
