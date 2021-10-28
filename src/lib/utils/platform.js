import { Platform } from 'react-native'
import { findKey, get } from 'lodash'

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
  osName,
  osVersion,
} from 'mobile-device-detect'
import { isEmulator as isEmulatedDevice } from 'react-native-device-info'

import isWebApp from './isWebApp'

import { appEnv } from './env'

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

export const isE2ERunning = isCypress && 'development' === appEnv

export const getOSVersion = `${osName} ${osVersion}`

export const useNativeDriverForAnimation = Platform.select({
  web: false,
  native: true,
})

export { isMobileWeb, isIOSWeb, isAndroidWeb, isMobileOnlyWeb, isTablet, isMobileSafari, isChrome }

//from https://github.com/f2etw/detect-inapp/blob/master/src/inapp.js
export class DetectWebview {
  BROWSER = {
    messenger: /\bFB[\w_]+\/(Messenger|MESSENGER)/,
    facebook: /\bFB[\w_]+\//,
    twitter: /\bTwitter/i,
    line: /\bLine\//i,
    wechat: /\bMicroMessenger\//i,
    puffin: /\bPuffin/i,
    miui: /\bMiuiBrowser\//i,
    instagram: /\bInstagram/i,
    chrome: /\bCrMo\b|CriOS|Android.*Chrome\/[.0-9]* (Mobile)?/,
    safari: /Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari/,
    ie: /IEMobile|MSIEMobile/,
    firefox: /fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile|FxiOS/,
  }

  ua = ''

  constructor(useragent) {
    this.ua = useragent
  }

  get browser() {
    return findKey(this.BROWSER, regex => regex.test(this.ua)) || 'other'
  }

  get isInWebview() {
    const rules = ['WebView', '(iPhone|iPod|iPad)(?!.*Safari/)', 'Android.*(wv|.0.0.0)']
    const regex = new RegExp(`(${rules.join('|')})`, 'ig')
    return Boolean(this.ua.match(regex))
  }
}
