import { Dimensions } from 'react-native'

const width = Dimensions.get('screen').width

export const isSmallDevice = width < 350
export const isMediumDevice = width >= 350 && width < 395
export const isLargeDevice = width >= 395
