import { Platform } from 'react-native'
import { get } from 'lodash'

import {
  isAndroid as isAndroidWeb,
  isBrowser as isBrowserWeb,
  isChrome,
  isIOS as isIOSWeb,
  isMobileOnly as isMobileOnlyWeb,
  isMobileSafari,
  isMobile as isMobileWeb,
  isSafari as isSafariWeb,
  isTablet,
} from 'mobile-device-detect'
import { env } from './env'
import isWebApp from './isWebApp'

export const isSafari = isMobileSafari || isSafariWeb

export const isWeb = Platform.OS === 'web'

export const isMobileReactNative = !isWeb

export const isIOSNative = Platform.OS === 'ios'

export const isAndroidNative = Platform.OS === 'android'

export const isMobileNative = isIOSNative || isAndroidNative

export const isMobileOnlyNative = isMobileNative && isTablet === false

export const isMobile = isMobileNative || isMobileWeb

export const isInstalledApp = isMobileNative || isWebApp

export const isMobileOnly = isMobileOnlyNative || isMobileOnlyWeb

export const isIOS = isIOSWeb || isIOSNative

export const isAndroid = isAndroidWeb || isAndroidNative

// if Platform.OS is 'web' (e.g. running on web), will return isBrowser flag from the device detect library.
// otherwise (e.g. running on native) will return false (because library wrongly returns true in that case)
export const isBrowser = isWeb ? isBrowserWeb : false

export const isCypress =
  !isMobileReactNative && 'undefined' !== typeof window && get(window, 'navigator.userAgent', '').includes('Cypress')

export const isE2ERunning = isCypress && 'development' === env

export { isMobileWeb, isIOSWeb, isAndroidWeb, isMobileOnlyWeb, isTablet, isMobileSafari, isChrome }
