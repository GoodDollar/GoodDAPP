import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'init' })

const { recaptchaSiteKey, publicUrl, fpSiteKey } = Config
const fpPromise = FingerprintJS.load({ apiKey: fpSiteKey })
const getFingerprintId = () => {
  // Initialize an agent at application startup.

  // Get the visitor identifier when you need it.
  return fpPromise.then(fp => fp.get())
}
const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const [isPassed, setIsPassed] = useState(false)

  const onVerify = useCallback(
    async (payload, ekey) => {
      let hasPassed = false
      try {
        const captchaType = captchaRef.current.type?.() || 'recaptcha'
        const fingerprint = await getFingerprintId()
        log.debug('Recaptcha payload', { payload, ekey, captchaType, fingerprint })
        const result = await API.verifyCaptcha({ payload, captchaType, fingerprint })
        captchaRef.current.reset()
        log.debug('Recaptcha verify result', { result })
        hasPassed = get(result, 'data.success', false)
      } catch (exception) {
        log.error('recaptcha verification failed', exception.message, exception, payload)
      } finally {
        if (hasPassed) {
          setIsPassed(true)
          onSuccess()
        } else {
          onFailure()
        }
      }
    },
    [setIsPassed, onSuccess, onFailure],
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
    <Captcha ref={captchaRef} siteKey={recaptchaSiteKey} baseUrl={publicUrl} onError={onFailure} onVerify={onVerify}>
      {children}
    </Captcha>
  )
})

export default Recaptcha
