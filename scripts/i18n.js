// this script runs AFTER lingui compile and auto generates dynamic imports
// according to the lungui settings in package.json. this allows us to avoid
// keeping application's i18n config manually in sync with lungui / crowdin

const { join } = require('path')
const { template, trim } = require('lodash')
const { writeFileSync } = require('fs')

const package = require('../package.json')
const { locales, sourceLocale } = package.lingui

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
`)

writeFileSync(localeFilesPath, localeFilesTmpl({
  sourceLocale,
  locales,
  localeKey,
  localeCode
}))
