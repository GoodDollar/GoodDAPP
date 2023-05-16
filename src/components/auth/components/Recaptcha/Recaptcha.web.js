import Config from '../../../../config/config'
import RecaptchaEngine from './engines/RecaptchaEngine'
import HCaptchaEngine from './engines/HCaptchaEngine'

const engines = {
  recaptcha: RecaptchaEngine,
  hcaptcha: HCaptchaEngine,
}

export default engines[Config.captchaEngine]
