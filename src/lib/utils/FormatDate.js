// @flow
import { filter } from 'lodash'
import moment from 'moment'
import { NativeModules, Platform } from 'react-native'

/**
 * format date util function
 * * DO NOT use .toLocaleString to format dates as it has limitations on android
 * @param {string} stringDate
 */
export const getFormattedDateTime = (stringDate: string = null) => {
  const locale = getLocaleByPlatform()
  moment.locale(locale())

  const localeData = moment.localeData()
  const format = localeData.longDateFormat('L')

  const momentTime = moment(...filter([stringDate]))
  return `${momentTime.format(format)} ${momentTime.format('HH:mm')}`
}

const getLocaleByPlatform = () =>
  Platform.select({
    web: () => window.navigator.userLanguage || window.navigator.language,
    ios: () =>
      NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0],
    android: () => NativeModules.I18nManager.localeIdentifier,
  })
