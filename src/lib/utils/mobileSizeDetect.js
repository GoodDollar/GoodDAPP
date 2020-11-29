import { Dimensions } from 'react-native'

const width = Dimensions.get('screen').width
const height = Dimensions.get('screen').height

export const isSmallDevice = width < 350
export const isMediumDevice = width >= 350 && width < 395
export const isLargeDevice = width >= 395
export const isShortDevice = height < 610
