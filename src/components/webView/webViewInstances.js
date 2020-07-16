import Config from '../../config/config'
import { createIframe } from './iframe.web'

export const PrivacyPolicyAndTerms = createIframe(
  `https://community.gooddollar.org/${Config.isEToro ? 'pilot-terms' : 'tou'}/`,
  'Privacy Policy & Terms',
)
export const PrivacyPolicy = createIframe('https://community.gooddollar.org/tou/#privacy-policy', 'Privacy Policy')

// export const PrivacyArticle = createIframe(
//   'https://medium.com/gooddollar/gooddollar-identity-pillar-balancing-identity-and-privacy-part-i-face-matching-d6864bcebf54',
//   'Privacy And Identity'
// )

export const Support = createIframe('https://support.gooddollar.org', ' Help & Feedback', true)
export const SupportForUnsigned = createIframe('https://support.gooddollar.org', ' Help & Feedback', true, 'Login')

export const Statistics = createIframe(Config.dashboardUrl, 'Statistics')
export const FAQ = createIframe(`https://community.gooddollar.org/faq${Config.isEToro ? '-etoro' : ''}`, 'FAQ')
