/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useCallback, useEffect, useState } from 'react'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { Helmet } from 'react-helmet'
import { AsyncStorage } from '@gooddollar/web3sdk-v2';

// This array should equal the array set in .linguirc
export const locales = ['de', 'en', 'es-AR', 'es', 'it', 'he', 'ro', 'ru', 'vi', 'zh-CN', 'zh-TW', 'ko', 'ja']
export const defaultLocale = 'en'

// Don't load plurals
locales.map(locale => i18n.loadLocaleData(locale, { plurals: () => null }))

const isLocaleValid = (locale: string) => locales.includes(locale)
const getInitialLocale = () => {
    // const detectedLocale = detect(fromStorage('lang'), fromNavigator(), () => defaultLocale)
    // return detectedLocale && isLocaleValid(detectedLocale) ? detectedLocale : defaultLocale

    return defaultLocale
}

async function activate(locale: string) {
    const { messages } = await import(`@lingui/loader!./locales/${locale}/catalog.json`)
    i18n.load(locale, messages)
    i18n.activate(locale)
}

export const LanguageContext = React.createContext<{
    setLanguage: (_: string) => void
    language: string
}>({
    setLanguage: (_: string) => null,
    language: ''
})

const LanguageProvider: FC = ({ children }) => {
    const [language, setLanguage] = useState(getInitialLocale)
    const [init, setInit] = useState(true)

    const _setLanguage = useCallback((language: string): void => {
        const switchLocale = (): void => {
            AsyncStorage.safeSet('lang', language)
            setLanguage(language)
        }

        if (init) {
            switchLocale()
            return
        }

        activate(language).then(switchLocale)
    }, [setLanguage, init])

    useEffect(() => {
        activate(language).then(() => setInit(false))
    }, [])

    if (init) return <></>

    return (
        <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
            <Helmet htmlAttributes={{ lang: language }} />
            <LanguageContext.Provider value={{ setLanguage: _setLanguage, language }}>
                {children}
            </LanguageContext.Provider>
        </I18nProvider>
    )
}

export default LanguageProvider
