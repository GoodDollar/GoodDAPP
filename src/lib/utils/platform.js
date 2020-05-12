import { Platform } from 'react-native'
import { get } from 'lodash'
import {
  isAndroid as isAndroidWeb,
  isIOS as isIOSWeb,
  isMobileOnly as isMobileOnlyWeb,
  isMobile as isMobileWeb,
  isTablet,
} from 'mobile-device-detect'
import isWebApp from './isWebApp'

export { isMobileSafari, isBrowser } from 'mobile-device-detect'

export const isMobileReactNative = Platform.OS !== 'web'

export const isIOSNative = Platform.OS === 'ios'

export const isAndroidNative = Platform.OS === 'android'

export const isMobileNative = isIOSNative || isAndroidNative

export const isMobileOnlyNative = isMobileNative && isTablet === false

export const isMobile = isMobileNative || isMobileWeb

export const isInstalledApp = isMobileNative || isWebApp

export const isMobileOnly = isMobileOnlyNative || isMobileOnlyWeb

export const isIOS = isIOSWeb || isIOSNative

export const isAndroid = isAndroidWeb || isAndroidNative

export const isCypress =
  !isMobileReactNative && 'undefined' !== typeof window && get(window, 'navigator.userAgent', '').includes('Cypress')

export { isMobileWeb, isIOSWeb, isAndroidWeb, isMobileOnlyWeb, isTablet }
