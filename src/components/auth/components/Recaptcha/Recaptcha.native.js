import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'

const Recaptcha = forwardRef(({ siteKey, baseUrl, onError, onVerify, children, ...props }, ref) => {
  const captchaRef = useRef()
  const onExpired = useCallback(() => captchaRef.current.close(), [])

  useImperativeHandle(ref, () => ({
    launch: () => captchaRef.current.open(),
  }))

  return (
    <>
      <ReCAPTCHA
        {...props}
        ref={captchaRef}
        siteKey={siteKey}
        baseUrl={baseUrl}
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
