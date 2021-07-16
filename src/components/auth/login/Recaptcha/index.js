import { noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef } from 'react'

import Config from '../../../../config/config'
import Captcha from './Recaptcha'

const { recaptchaSiteKey, publicUrl } = Config

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop }, ref) => {
  const isPassedRef = useRef(false)
  const captchaRef = useRef()

  const onStatusChange = useCallback(
    result => {
      isPassedRef.current = !!result
      ;(result ? onSuccess : onFailure)()
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

  return <Captcha ref={captchaRef} siteKey={recaptchaSiteKey} baseUrl={publicUrl} onStatusChange={onStatusChange} />
})

export default Recaptcha
