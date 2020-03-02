import { Platform } from 'react-native'
import {
  isAndroid as isAndroidWeb,
  isIOS as isIOSWeb,
  isMobileOnly as isMobileOnlyWeb,
  isMobile as isMobileWeb,
} from 'mobile-device-detect'
import DeviceInfo from 'react-native-device-info'
import isWebApp from './isWebApp'

export { isMobileSafari, isBrowser } from 'mobile-device-detect'

export { isMobileWeb, isIOSWeb, isAndroidWeb, isMobileOnlyWeb }

export const isIOSNative = Platform.OS === 'ios'

export const isAndroidNative = Platform.OS === 'android'

export const isMobileNative = isIOSNative || isAndroidNative

export const isMobileOnlyNative = isMobileNative && DeviceInfo.isTablet() === false

export const isMobile = isMobileNative || isMobileWeb

export const isInstalledApp = isMobileNative || isWebApp

export const isMobileOnly = isMobileOnlyNative || isMobileOnlyWeb

export const isIOS = isIOSWeb || isIOSNative

export const isAndroid = isAndroidWeb || isAndroidNative
