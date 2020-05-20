import { Platform } from 'react-native'
import { get } from 'lodash'
import {
  isAndroid as isAndroidWeb,
  isIOS as isIOSWeb,
  isMobileOnly as isMobileOnlyWeb,
  isMobile as isMobileWeb,
} from 'mobile-device-detect'
import isWebApp from './isWebApp'
import isTablet from './isTablet'
import { env } from './env'

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

export const isE2ERunning = isCypress && 'development' === env

export { isMobileWeb, isIOSWeb, isAndroidWeb, isMobileOnlyWeb, isTablet }
