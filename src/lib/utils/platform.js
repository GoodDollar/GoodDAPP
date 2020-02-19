import { Platform } from 'react-native'
import * as mobileWebDetect from 'mobile-device-detect'
import DeviceInfo from 'react-native-device-info'
import isWebApp from './isWebApp'

export * from 'mobile-device-detect'

export const isMobileWeb = mobileWebDetect.isMobile

export const isIOSWeb = mobileWebDetect.isIOS

export const isAndroidWeb = mobileWebDetect.isAndroid

export const isIOSNative = Platform.OS === 'ios'

export const isAndroidNative = Platform.OS === 'android'

export const isMobileNative = isIOSNative || isAndroidNative

export const isMobileOnlyNative = !DeviceInfo.isTablet() && isMobileNative

export const isMobile = isMobileNative || isMobileWeb

export const isInstalledApp = isMobileNative || isWebApp

export const isMobileOnly = isMobileOnlyNative || mobileWebDetect.isMobileOnly

export const isIOS = isIOSWeb || isIOSNative

export const isAndroid = isAndroidWeb || isAndroidNative
