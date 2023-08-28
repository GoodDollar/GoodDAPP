import { assign, flatten, intersection, isFunction, uniq } from 'lodash'
import * as RNLocalize from 'react-native-localize'
import React, { useCallback, useEffect, useState } from 'react'

import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { Helmet } from 'react-helmet'

import logger from '../lib/logger/js-logger'
import AsyncStorage from '../lib/utils/asyncStorage'
import { fallback } from '../lib/utils/async'

import { defaultMessages, localeFiles, localesCodes, sourceLocale } from './locales'

const log = logger.child({ from: 'I18n' })

export const locales = localesCodes
export const defaultLocale = sourceLocale

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

    log.debug('Default locale activated', { defaultLocale, defaultMessages })
  }

  isLocaleValid(locale) {
    const { locales, localeFiles } = this

    return locales.includes(locale) && locale in localeFiles
  }

  async getInitialLocale() {
    const { defaultLocale, locales } = this

    // first we check if user selected default language in settings
    // if no default or lang is set to DD, we use system detect
    const detectedLocale = await this._detect(
      async () => {
        const lang = await AsyncStorage.getItem('lang')

        if (lang) {
          return lang
        }

        const sysLocales = uniq(
          flatten(
            RNLocalize.getLocales().map(locale => ['Code', 'Tag'].map(prop => locale[`language${prop}`].toLowerCase())),
          ),
        )

        log.debug('Detect locale - System', { sysLocales })

        const { languageTag = {} } = RNLocalize.findBestAvailableLanguage(intersection(locales, sysLocales))

        if (this.isLocaleValid(languageTag)) {
          log.debug('Delect locale - System', { languageTag })
          return languageTag
        }

        if (languageTag.includes('-')) {
          const [language] = languageTag.split('-')

          if (this.isLocaleValid(language)) {
            log.debug('Delect locale - System', { language })
            return language
          }
        }
      },

      // if all fail, we use default 'en'
      () => {
        log.debug('Delect locale - Fallback', { defaultLocale })
        return defaultLocale
      },
    )

    if (detectedLocale) {
      log.debug('Detected locale', { detectedLocale })

      if (this.isLocaleValid(detectedLocale)) {
        return detectedLocale
      }
    }

    log.debug('Delect locale - Fallback', { defaultLocale })
    return defaultLocale
  }

  async dynamicActivate(locale) {
    const { messages } = await this.localeFiles[locale]()
    const { i18n } = this

    i18n.load(locale, messages)
    i18n.activate(locale)
    log.debug('Activated locale', { locale, messages })

    await AsyncStorage.setItem('lang', locale)
    log.debug('AsyncStorage updated', { locale })
  }

  /** @private */
  // eslint-disable-next-line require-await
  async _detect(...detectors) {
    return fallback(
      detectors.map(detector => async () => {
        const detectedValue = await Promise.resolve(isFunction(detector) ? detector() : detector)

        if (!detectedValue) {
          throw new Error('No locale has been detected, falling back to the next one resolver')
        }

        return detectedValue
      }),
    )
  }
}(i18n, { locales, defaultLocale, localeFiles })

export const LanguageContext = React.createContext({
  // eslint-disable-next-line require-await
  setLanguage: async () => null,
  defaultLocale: '',
  language: '',
})

const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(null)

  const setLanguage = useCallback(
    async language => {
      let locale = language

      if (!language) {
        await AsyncStorage.removeItem('lang')
        locale = await I18n.getInitialLocale()
      }

      await I18n.dynamicActivate(locale)
      setCurrentLanguage(locale)
    },
    [setCurrentLanguage],
  )

  useEffect(() => {
    I18n.getInitialLocale().then(setLanguage)
  }, [setLanguage])

  const { defaultLocale } = I18n

  // use default locale if async loading is not completed
  const language = currentLanguage || defaultLocale
  const contextValue = { setLanguage, language, defaultLocale }

  return (
    <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
      <Helmet htmlAttributes={{ lang: language }} />
      <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
    </I18nProvider>
  )
}

export default LanguageProvider
