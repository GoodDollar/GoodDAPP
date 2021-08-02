import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

const Recaptcha = forwardRef(({ siteKey, baseUrl, onStatusChange, children, ...props }, ref) => {
  const captchaRef = useRef()

  useImperativeHandle(ref, () => ({
    launch: () => captchaRef.current.execute(),
  }))

  return (
    <>
      <ReCAPTCHA
        {...props}
        ref={captchaRef}
        sitekey={siteKey}
        onChange={onStatusChange}
        onErrored={onStatusChange}
        onExpired={onStatusChange}
        size="invisible"
      />
      {children}
    </>
  )
})

export default Recaptcha
