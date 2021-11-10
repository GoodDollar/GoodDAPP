export const AVATAR_SIZE = 320
export const SMALL_AVATAR_SIZE = 50
export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600

export const getBase64Source = source => ({ uri: source })
export const isGoodDollarImage = source => source === -1

export * from './image/resize'
