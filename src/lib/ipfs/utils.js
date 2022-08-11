import { isString } from 'lodash'
import { CID } from 'multiformats/cid'

const cidRegexp = /^[\w\d]+$/i

// checks is string a valid CID. it should be at least 40 chars length and contrain only letters & numbers
export const isValidCID = source => isString(source) && source.length >= 40 && cidRegexp.test(source)

// eslint-disable-next-line
export const toV1 = cid => CID.parse(cid).toV1().toString()
