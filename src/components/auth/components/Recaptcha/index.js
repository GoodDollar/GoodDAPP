import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API'
import { useDialog } from '../../../../lib/dialog/useDialog'
import LoadingIcon from '../../../common/modal/LoadingIcon'
import { useFingerprint } from '../../../../lib/fingerprint/useFingerprint'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'recaptcha' })

const { recaptchaSiteKey, publicUrl } = Config

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const { showDialog, hideDialog } = useDialog()
  const [isPassed, setIsPassed] = useState(false)
  const { getFingerprintId } = useFingerprint()

  const onVerify = useCallback(
    async (payload, ekey) => {
      let result
      let fingerprint
      let hasPassed = false
      const captchaType = captchaRef.current.type?.() || 'recaptcha'

      try {
        showDialog({ title: 'Verifying CAPTCHA', image: <LoadingIcon />, showCloseButtons: false, showButtons: false })

        fingerprint = await getFingerprintId()
        log.debug('Recaptcha payload', { payload, ekey, captchaType, fingerprint })

        result = await API.verifyCaptcha({ payload, captchaType, fingerprint })
        hasPassed = get(result, 'success', false)
        log.debug('Recaptcha verify result', { result, hasPassed })
      } catch (exception) {
        const { message } = exception
        const errorCtx = { payload, ekey, captchaType, fingerprint, result }

        log.error('recaptcha verification failed', message, exception, errorCtx)
      }

      hideDialog()

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
    <Captcha ref={captchaRef} siteKey={recaptchaSiteKey} baseUrl={publicUrl} onError={onFailure} onVerify={onVerify}>
      {children}
    </Captcha>
  )
})

export default Recaptcha
