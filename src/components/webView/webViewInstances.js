import { trimEnd } from 'lodash'

import Config from '../../config/config'
import { createIframe } from './iframe.web'

const { isEToro, dashboardUrl, isPhaseOne } = Config

const tou = isPhaseOne ? 'tou1' : 'tou'
const faq = `faq${isEToro ? '-etoro' : ''}`
export const dashboardLink = trimEnd(dashboardUrl, ' #/')

export const PrivacyPolicyAndTerms = createIframe(`https://community.gooddollar.org/${tou}/`, 'Privacy Policy & Terms')
export const PrivacyPolicy = createIframe(`https://community.gooddollar.org/${tou}/#privacy-policy`, 'Privacy Policy')

export const Support = createIframe('https://help.gooddollar.org', ' Help & Feedback', true)
export const SupportForUnsigned = createIframe('https://help.gooddollar.org', ' Help & Feedback', true, 'Login')

export const Statistics = createIframe(`${dashboardLink}/admin/dashboard`, 'Statistics')
export const FAQ = createIframe(`https://community.gooddollar.org/${faq}`, 'FAQ')
