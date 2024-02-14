// this script runs AFTER lingui compile and auto generates dynamic imports
// according to the lungui settings in package.json. this allows us to avoid
// keeping application's i18n config manually in sync with lungui / crowdin

const { join } = require('path')
const { template, trim } = require('lodash')
const { writeFileSync } = require('fs')

const package = require('../package.json')
const { locales, sourceLocale } = package.lingui


const lcid = require('windows-locale')

// setup locale map for language selector

// some locales are not directly mappable to a country code and then would fail to retreive a flag icon
const customLocaleMap = [
  { code: 'en', countryCode: 'US', name: 'English-United States' },
  { code: 'es-419', countryCode: 'AR', name: 'Español Latinoamericano' },
  { code: 'hi', countryCode: 'IN', name: 'हिन्दी' },
  { code: 'zh', countryCode: 'CN', name: '中文' },
  { code: 'uk', countryCode: 'UA', name: 'Українська' },
  { code: 'ko', countryCode: 'KR', name: '한국어' },
  { code: 'vi', countryCode: 'VN', name: 'Tiếng Việt' },
  { code: 'es-us', countryCode: 'UM', name: 'Español-United States' },
]

// filter custom locales out of the locales array
const filteredLocales = locales.filter(locale => !customLocaleMap.map(customLocale => customLocale.code).includes(locale));

// map the filtered locales to a country code (used for retreiving flag icons) 
// and their language name (used in language selector)
const localeCodeMap = filteredLocales.map(locale => {
  const { language, location } = lcid[locale]
  const countryCode = locale.split('-').at(-1).toUpperCase()
  
  // todo: get native translation of language name
  const name = language + (location ? '-' + location : '')
  
  return customLocaleMap.push({ code: locale, countryCode: countryCode, name: name })
})

// Prepare build + json files
const localeCode = locale => `'${locale}'`
const localeKey = locale => locale.includes('-') ? localeCode(locale) : locale
const localeFilesPath = join(__dirname, '../src/language/locales', 'index.js')

const localeFilesTmpl = template(`export { messages as defaultMessages } from './<%= sourceLocale %>/catalog'

export const localesCodes = [<% _.forEach(locales, function(locale) { %>
  <%= localeCode(locale) %>,<% }) %>
]

export const sourceLocale = <%= localeCode(sourceLocale) %>

export const localeFiles = {<% _.forEach(locales, function(locale) { %>
  <%= localeKey(locale) %>: () => import('./<%= locale %>/catalog.js'),<% }) %>
}

// for supported country list in language selector
export const countryCodes = [<% _.forEach(customLocaleMap, function(locale) { %>
  '<%= locale.countryCode %>',<% }) %>
]

export const countryCodeToLocale = {<% _.forEach(customLocaleMap, function(locale) { %>
  <%= localeCode(locale.countryCode) %>: '<%= locale.code %>',<% }) %>
}

export const languageLabels = {<% _.forEach(customLocaleMap, function(locale) { %>
  <%= localeCode(locale.countryCode) %>: '<%= locale.name %>',<% }) %>
}
`)

writeFileSync(localeFilesPath, localeFilesTmpl({
  sourceLocale,
  locales,
  localeKey,
  localeCode,
  customLocaleMap
}))
