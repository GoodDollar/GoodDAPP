import { Platform } from 'react-native'
import { isMobile as isMobileWeb, isMobileOnly as isMobileWebOnly } from 'mobile-device-detect'
import isWebApp from './isWebApp'

export const isMobileReactNative = Platform.OS === 'android' || Platform.OS === 'ios'

export const isMobile = isMobileReactNative || isMobileWeb

export const isInstalledApp = isMobileReactNative || isWebApp

// TODO: RN - Need to implement isMobileOnlyReactNative
export const isMobileOnly = isMobileReactNative || isMobileWebOnly
