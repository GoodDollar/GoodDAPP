import { Platform } from 'react-native'
import { get, over } from 'lodash'
import isUAWebView from 'is-ua-webview'

import {
  osName as detectedOS,
  osVersion as detectedOSVersion,
  isAndroid as isAndroidWeb,
  isBrowser as isBrowserWeb,
  isChrome,
  isFirefox,
  isIOS as isIOSWeb,
  isMobileOnly as isMobileOnlyWeb,
  isMobileSafari,
  isMobile as isMobileWeb,
  isSafari as isSafariWeb,
  isTablet,
} from 'mobile-device-detect'

import { getSystemName, getSystemVersion, isEmulator as isEmulatedDevice } from './deviceInfo'

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

export const isEmulator = isMobileNative ? isEmulatedDevice() : Promise.resolve(false)

export const isCypress =
  !isMobileReactNative && 'undefined' !== typeof window && get(window, 'navigator.userAgent', '').includes('Cypress')

export const osVersionInfo = (() => {
  const [osName, version] = Platform.select({
    web: () => [detectedOS, detectedOSVersion],
    default: over([getSystemName, getSystemVersion]),
  })()

  const [major, minor = 0, patch = 0, build = 0] = version.split('.').map(Number)

  return { osName, version, major, minor, patch, build }
})()

export const osVersion = (() => {
  const { osName, version } = osVersionInfo

  return `${osName} ${version}`
})()

export const useNativeDriverForAnimation = Platform.select({
  web: false,
  native: true,
})

const iosSupportedWeb =
  isSafari ||
  ((osVersionInfo.major > 14 || (osVersionInfo.major === 14 && osVersionInfo.minor >= 4)) && (isChrome || isFirefox))

export const isWebView = Platform.select({
  default: () => false,
  web: () => {
    const { ReactNativeWebView, navigator, ethereum } = window
    const { userAgent, standalone } = navigator

    const isUserAgentWV = isUAWebView(userAgent)
    const isReactNativeWV = !!ReactNativeWebView
    const isIOSWV = isUserAgentWV || (!standalone && !isSafariWeb)
    const isAndroidWV = isUserAgentWV
    const isMinipay = !!ethereum?.isMiniPay //allow opera minipay as compatible webview

    if (isMinipay) {
      return false
    }

    return isReactNativeWV || (isIOSWeb ? isIOSWV : isAndroidWV)
  },
})()

export {
  isMobileWeb,
  isIOSWeb,
  isAndroidWeb,
  isMobileOnlyWeb,
  isTablet,
  isMobileSafari,
  isChrome,
  isFirefox,
  iosSupportedWeb,
}
