import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import { Platform } from 'react-native'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API'
import { useFingerprint } from '../../../../lib/fingerprint/useFingerprint'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'recaptcha' })

const { recaptchaSiteKey, hcaptchaSiteKey, publicUrl, defaultCaptcha } = Config

const Recaptcha = React.forwardRef(({ type = defaultCaptcha, onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const [isPassed, setIsPassed] = useState(false)
  const { getFingerprintId } = useFingerprint()
  const siteKey = type === 'recaptcha' ? recaptchaSiteKey : hcaptchaSiteKey
  const native = Platform.OS !== 'web'

  const onVerify = useCallback(
    async (payload, ekey) => {
      let result
      let fingerprint
      let hasPassed = false

      try {
        fingerprint = await getFingerprintId()
        log.debug('Recaptcha payload', { payload, ekey, type, native, fingerprint })

        result = await API.verifyCaptcha({ payload, type, native, fingerprint })
        log.debug('Recaptcha verify result', { result })
        hasPassed = get(result, 'data.success', false)
      } catch (exception) {
        const { message } = exception
        const errorCtx = { payload, ekey, type, native, fingerprint, result }

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
    <Captcha ref={captchaRef} type={type} siteKey={siteKey} baseUrl={publicUrl} onError={onFailure} onVerify={onVerify}>
      {children}
    </Captcha>
  )
})

export default Recaptcha
