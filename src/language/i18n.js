/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { Helmet } from 'react-helmet'
import { messages as defaultMessages } from './locales/en/catalog'

// This array should equal the array set in .linguirc
export const locales = ['de', 'en', 'es-AR', 'es', 'it', 'he', 'ro', 'ru', 'vi', 'zh-CN', 'zh-TW', 'ko', 'ja']
export const defaultLocale = 'en'

locales.map(locale => i18n.loadLocaleData(locale, { plurals: () => null })) // Doesn't load plurals. This is a list used for implementing a language selector.

//Loading english as default to prevent async loading problems.
i18n.loadLocaleData(defaultLocale, { plurals: () => null })
i18n.load(defaultLocale, defaultMessages)
i18n.activate(defaultLocale)

//const isLocaleValid = locale => locales.includes(locale)
const getInitialLocale = () => {
  // const detectedLocale = detect(fromStorage('lang'), fromNavigator(), () => defaultLocale)
  // return detectedLocale && isLocaleValid(detectedLocale) ? detectedLocale : defaultLocale

  return defaultLocale
}

async function dynamicActivate(locale) {
  const { messages } = await import(`@lingui/loader!./locales/${locale}/catalog.json`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}

export const LanguageContext = React.createContext({
  setLanguage: _ => null,
  language: '',
})

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLocale())
  const [init, setInit] = useState(true)

  const _setLanguage = language => {
    if (!init) {
      dynamicActivate(language).then(() => {
        localStorage.setItem('lang', language)
        setLanguage(language)
      })
    } else {
      localStorage.setItem('lang', language)
      setLanguage(language)
    }
  }

  useEffect(() => {
    const load = async () => {
      await dynamicActivate(language)
      setInit(false)
    }

    load()
  }, [])

  //render if async loading is not completed
  if (init) {
    return (
      <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
        <Helmet htmlAttributes={{ lang: defaultLocale }} />
        <LanguageContext.Provider value={{ setLanguage: _setLanguage, defaultLocale }}>
          {children}
        </LanguageContext.Provider>
      </I18nProvider>
    )
  }

  //render if async loading is completed
  return (
    <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
      <Helmet htmlAttributes={{ lang: language }} />
      <LanguageContext.Provider value={{ setLanguage: _setLanguage, language }}>{children}</LanguageContext.Provider>
    </I18nProvider>
  )
}

export default LanguageProvider
