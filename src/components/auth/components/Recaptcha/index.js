import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API'
import { useFingerprint } from '../../../../lib/fingerprint/useFingerprint'
import { isWeb } from '../../../../lib/utils/platform'
import DefaultCaptcha from './Recaptcha'
import ReCaptchaWeb from './RecaptchaWeb' // added .web suffix to exclude form native build

const log = logger.child({ from: 'recaptcha' })

const { recaptchaSiteKey, hcaptchaSiteKey, captchaEngine, publicUrl } = Config
const isHCaptcha = captchaEngine === 'hcaptcha'
const siteKey = isWeb && isHCaptcha ? hcaptchaSiteKey : recaptchaSiteKey
const Captcha = !isWeb || isHCaptcha ? DefaultCaptcha : ReCaptchaWeb

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const [isPassed, setIsPassed] = useState(false)
  const { getFingerprintId } = useFingerprint()

  const onVerify = useCallback(
    async (payload, ekey) => {
      let result
      let fingerprint
      let hasPassed = false
      const captchaType = captchaRef.current.type?.() || 'recaptcha'

      try {
        fingerprint = await getFingerprintId()
        log.debug('Recaptcha payload', { payload, ekey, captchaType, fingerprint })

        result = await API.verifyCaptcha({ payload, captchaType, fingerprint })
        log.debug('Recaptcha verify result', { result })
        hasPassed = get(result, 'success', false)
      } catch (exception) {
        const { message } = exception
        const errorCtx = { payload, ekey, captchaType, fingerprint, result }

        log.error('recaptcha verification failed', message, exception, errorCtx)
      }

      if (!hasPassed) {
        onFailure()
        return
      }

      setIsPassed(true)
      onSuccess()
    },
    [setIsPassed, onSuccess, onFailure, getFingerprintId],
  )

  useImperativeHandle(
    ref,
    () => ({
      hasPassedCheck: () => isPassed,
      launchCheck: () => {
        if (isPassed) {
          return
        }

        captchaRef.current.launch()
      },
    }),
    [isPassed],
  )

  return (
    <Captcha ref={captchaRef} siteKey={siteKey} baseUrl={publicUrl} onError={onFailure} onVerify={onVerify}>
      {children}
    </Captcha>
  )
})

export default Recaptcha
