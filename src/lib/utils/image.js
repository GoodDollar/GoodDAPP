import { isNumber, isString } from 'lodash'

export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600

export * from './image/helpers'

export const isValidBase64Image = source =>
  isString(source) && source.startsWith('data:image/') && source.includes(';base64,')

export const isValidLocalImage = source => isNumber(source) && source > 0

export const isValidImage = source =>
  isValidLocalImage(source) ? source : isValidBase64Image(source) ? { uri: source } : null
