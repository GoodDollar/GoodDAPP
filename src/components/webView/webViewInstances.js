import { trimEnd } from 'lodash'

import Config from '../../config/config'
import { createIframe } from './iframe'

const { dashboardUrl } = Config

const dashboard = trimEnd(dashboardUrl, ' #/')

export const TermsOfUse = createIframe('https://www.gooddollar.org/terms-conditions/?gd-frame=1', 'Terms Of Use')

// export const PrivacyPolicyAndTerms = createIframe(`https://community.gooddollar.org/${tou}/`, 'Privacy Policy & Terms')
export const PrivacyPolicy = createIframe('https://www.gooddollar.org/privacy-policy/?gd-frame=1', 'Privacy Policy')

export const Support = createIframe('https://help.gooddollar.org?transitioned=1', ' Help & Feedback', true)

export const Statistics = createIframe(`${dashboard}`, 'Statistics')

// export const FAQ = createIframe(`https://community.gooddollar.org/${faq}`, 'FAQ')
