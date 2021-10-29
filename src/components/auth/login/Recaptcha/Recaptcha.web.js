import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import Reaptcha from 'reaptcha'

const Recaptcha = forwardRef(({ siteKey, onLoad, onStatusChange, children, ...props }, ref) => {
  const captchaRef = useRef()
  const setCaptchaRef = useCallback(ref => (captchaRef.current = ref), [])

  useImperativeHandle(ref, () => ({
    launch: () => captchaRef.current.execute(),
  }))

  return (
    <>
      <Reaptcha
        {...props}
        ref={setCaptchaRef}
        sitekey={siteKey}
        size="invisible"
        onLoad={onLoad}
        onVerify={onStatusChange}
        onError={onStatusChange}
        onExpire={onStatusChange}
      />
      {children}
    </>
  )
})

export default Recaptcha
