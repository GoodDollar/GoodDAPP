import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API/api'
import usePromise from '../../../../lib/hooks/usePromise'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'init' })

const { recaptchaSiteKey, publicUrl } = Config

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const [isPassed, setIsPassed] = useState(false)
  const [whenLoaded, setLoaded] = usePromise()

  const onStatusChange = useCallback(
    async payload => {
      let hasPassed = false
      log.debug('Recaptcha payload', payload)

      try {
        const result = await API.verifyCaptcha(payload)

        log.debug('Recaptcha verify result', result)
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
      launchCheck: async () => {
        if (isPassed) {
          return
        }

        await whenLoaded
        captchaRef.current.launch()
      },
    }),
    [isPassed, whenLoaded],
  )

  return (
    <Captcha
      ref={captchaRef}
      siteKey={recaptchaSiteKey}
      baseUrl={publicUrl}
      onLoad={setLoaded}
      onStatusChange={onStatusChange}
    >
      {children}
    </Captcha>
  )
})

export default Recaptcha
