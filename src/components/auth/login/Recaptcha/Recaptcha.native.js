import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'

const Recaptcha = forwardRef(({ siteKey, baseUrl, onLoad, onStatusChange, children, ...props }, ref) => {
  const captchaRef = useRef()

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
        onLoad={onLoad}
        onExpire={onStatusChange}
        onError={onStatusChange}
        onVerify={onStatusChange}
      />
      {children}
    </>
  )
})

export default Recaptcha
