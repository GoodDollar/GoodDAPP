import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'
import { noop } from 'lodash'
import Config from '../../../../config/config'

const { recaptchaSiteKey, publicUrl } = Config

const Recaptcha = forwardRef(({ onError, onVerify, children, ...props }, ref) => {
  const captchaRef = useRef()
  const onExpired = useCallback(() => captchaRef.current.close(), [])

  useImperativeHandle(ref, () => ({
    launch: () => captchaRef.current.open(),
    type: () => {
      return 'recaptcha-native'
    },
    reset: noop,
  }))

  return (
    <>
      <ReCAPTCHA
        {...props}
        ref={captchaRef}
        siteKey={recaptchaSiteKey}
        baseUrl={publicUrl}
        size="normal"
        onExpire={onExpired}
        onError={onError}
        onVerify={onVerify}
      />
      {children}
    </>
  )
})

export default Recaptcha
