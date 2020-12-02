import { NativeModules, Platform } from 'react-native'
import { first } from 'lodash'

const detectLocaleWeb = () => {
  const { userLanguage, language } = window.navigator

  return { userLanguage || language }
}

const detectLocaleIOS = () => {
  const { AppleLocale, AppleLanguages } =  NativeModules.SettingsManager.settings

  return AppleLocale || first(AppleLanguages)
}

const detectLocaleAndroid = () => NativeModules.I18nManager.localeIdentifier

export const locale = Platform.select({
  web: detectLocaleWeb,
  ios: detectLocaleIOS,
  android: detectLocaleAndroid
})()
