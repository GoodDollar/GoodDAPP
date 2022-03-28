/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { Helmet } from 'react-helmet'
import { detect } from '@lingui/detect-locale'
import { assign } from 'lodash'
import AsyncStorage from '../lib/utils/asyncStorage'
import { messages as defaultMessages } from './locales/en/catalog'

export const localeFiles = {
  de: () => import(`./locales/de/catalog.js`),
  en: () => import(`./locales/en/catalog.js`),
  'es-AR': () => import(`./locales/es-AR/catalog.js`),
  it: () => import(`./locales/it/catalog.js`),
  he: () => import(`./locales/he/catalog.js`),
  ro: () => import(`./locales/ro/catalog.js`),
  ru: () => import(`./locales/ru/catalog.js`),
  vi: () => import(`./locales/vi/catalog.js`),
  'zh-CN': () => import(`./locales/zh-CN/catalog.js`),
  'zh-TW': () => import(`./locales/zh-TW/catalog.js`),
  ko: () => import(`./locales/ko/catalog.js`),
  ja: () => import(`./locales/ja/catalog.js`),
}

// This array should equal the array set in .linguirc
export const locales = ['de', 'en', 'es-AR', 'es', 'it', 'he', 'ro', 'ru', 'vi', 'zh-CN', 'zh-TW', 'ko', 'ja']
export const defaultLocale = 'en'

const I18n = new class {
  constructor(i18n, options) {
    assign(this, { i18n, ...options })

    // Doesn't load plurals. This is a list used for implementing a language selector.
    this.locales.map(locale => i18n.loadLocaleData(locale, { plurals: () => null }))

    const { defaultLocale } = this

    // Loading english as default to prevent async loading problems.
    i18n.loadLocaleData(defaultLocale, { plurals: () => null })
    i18n.load(defaultLocale, defaultMessages)
    i18n.activate(defaultLocale)
  }

  isLocaleValid(locale) {
    return this.locales.includes(locale)
  }

  async getInitialLocale() {
    const { defaultLocale } = this

    const detectedLocale = await detect(
      // eslint-disable-next-line require-await
      async () => AsyncStorage.getItem('lang'),

      // TODO: insert platform-specific (web/android) system locale detection here
      // eslint-disable-next-line require-await
      async () => defaultLocale,
    )

    return detectedLocale && this.isLocaleValid(detectedLocale) ? detectedLocale : defaultLocale
  }

  async dynamicActivate(locale) {
    const { messages } = await this.localeFiles[locale]()
    const { i18n } = this

    i18n.load(locale, messages)
    i18n.activate(locale)

    await AsyncStorage.setItem('lang', locale)
  }
}()(i18n, { locales, defaultLocale, localeFiles })

export const LanguageContext = React.createContext({
  setLanguage: _ => null,
  language: '',
})

const LanguageProvider = ({ children }) => {
  const [language, setCurrentLanguage] = useState(null)

  const setLanguage = useCallback(
    async language => {
      await I18n.dynamicActivate(language)
      setCurrentLanguage(language)
    },
    [setCurrentLanguage],
  )

  useEffect(() => {
    I18n.getInitialLocale().then(setLanguage)
  }, [setLanguage])

  const { defaultLocale } = I18n
  const contextValue = { setLanguage, language, defaultLocale }

  // do not render if async loading is not completed
  if (!language) {
    return null
  }

  return (
    <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
      <Helmet htmlAttributes={{ lang: language }} />
      <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
    </I18nProvider>
  )
}

export default LanguageProvider
