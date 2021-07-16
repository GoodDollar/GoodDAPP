import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'

const Recaptcha = forwardRef(({ siteKey, baseUrl, onStatusChange, ...props }, ref) => {
  const captchaRef = useRef()

  useImperativeHandle(ref, () => ({
    launch: () => captchaRef.current.open(),
  }))

  return (
    <ReCAPTCHA
      {...props}
      ref={captchaRef}
      siteKey={siteKey}
      baseUrl={baseUrl}
      size="normal"
      onExpire={onStatusChange}
      onError={onStatusChange}
      onVerify={onStatusChange}
    />
  )
})

export default Recaptcha
