import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef } from 'react'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API/api'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'init' })

const { recaptchaSiteKey, publicUrl } = Config

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const isReadyRef = useRef()
  const setReadyRef = useRef()
  const isPassedRef = useRef(false)
  const onCaptchaLoaded = useCallback(() => setReadyRef.current(), [])

  const onStatusChange = useCallback(
    async payload => {
      log.debug('Recaptcha payload', payload)

      try {
        const result = await API.verifyCaptcha(payload)

        log.debug('Recaptcha verify result', result)
        isPassedRef.current = get(result, 'data.success', false)
      } catch (exception) {
        log.error('recaptcha verification failed', exception.message, exception, payload)
      } finally {
        ;(isPassedRef.current ? onSuccess : onFailure)()
      }
    },
    [onSuccess, onFailure],
  )

  useImperativeHandle(ref, () => ({
    hasPassedCheck: () => isPassedRef.current,
    launchCheck: async () => {
      if (isPassedRef.current) {
        return
      }

      await isReadyRef.current
      captchaRef.current.launch()
    },
  }))
  ;(() => {
    if (isReadyRef.current) {
      return
    }

    isReadyRef.current = new Promise(resolve => (setReadyRef.current = resolve))
  })()

  return (
    <Captcha
      ref={captchaRef}
      siteKey={recaptchaSiteKey}
      baseUrl={publicUrl}
      onLoad={onCaptchaLoaded}
      onStatusChange={onStatusChange}
    >
      {children}
    </Captcha>
  )
})

export default Recaptcha
