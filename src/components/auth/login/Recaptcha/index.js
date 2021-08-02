import { noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef } from 'react'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import API from '../../../../lib/API/api'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'init' })

const { recaptchaSiteKey, publicUrl } = Config

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const isPassedRef = useRef(false)
  const captchaRef = useRef()

  const onStatusChange = useCallback(
    async result => {
      log.debug('Recaptcha result', result)
      let hasPassed
      try {
        const res = await API.verifyCaptcha(result)
        log.debug('Recaptcha verify res', res)

        if (res.data.success) {
          hasPassed = true
        } else {
          hasPassed = false
        }
      } catch (exception) {
        log.error('recaptcha verification failed', exception, result)
        hasPassed = false
      } finally {
        isPassedRef.current = hasPassed
        ;(hasPassed ? onSuccess : onFailure)()
      }
    },
    [onSuccess, onFailure],
  )

  useImperativeHandle(ref, () => ({
    hasPassedCheck: () => isPassedRef.current,
    launchCheck: () => {
      if (isPassedRef.current) {
        return
      }

      captchaRef.current.launch()
    },
  }))

  return (
    <Captcha ref={captchaRef} siteKey={recaptchaSiteKey} baseUrl={publicUrl} onStatusChange={onStatusChange}>
      {children}
    </Captcha>
  )
})

export default Recaptcha
