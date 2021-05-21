import { isNumber, isString } from 'lodash'
import { isValidAsset } from './assets'

export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600

export * from './imageHelpers'

export const isValidBase64Image = source =>
  isString(source) && source.startsWith('data:image/') && source.includes(';base64,')

export const isGoodDollarImage = source => source === -1

export const isValidLocalImage = source => isNumber(source) && source > 0 && isValidAsset(source)

export const isValidRootImage = source => isString(source) && source.startsWith('/') && source.split('.').length > 1

export const isValidImage = source =>
  isValidLocalImage(source) || isValidRootImage(source) ? source : isValidBase64Image(source) ? { uri: source } : null
