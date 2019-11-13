import Config from '../../config/config'
import { createIframe } from './iframe.web'

export const TermsOfUse = createIframe(
  `https://community.gooddollar.org/${Config.isEToro ? 'pilot-terms' : 'dappterms'}/`,
  'Terms of Use'
)
export const PrivacyPolicy = createIframe('https://community.gooddollar.org/pp/', 'Privacy Policy')
export const PrivacyArticle = createIframe(
  'https://medium.com/gooddollar/gooddollar-identity-pillar-balancing-identity-and-privacy-part-i-face-matching-d6864bcebf54',
  'Privacy And Identity'
)
export const Support = createIframe('https://community.gooddollar.org/support-iframe/', 'Feedback & Support')
export const FAQ = createIframe(`https://community.gooddollar.org/faq-${Config.isEToro ? 'etoro' : 'iframe'}`, 'FAQ')
