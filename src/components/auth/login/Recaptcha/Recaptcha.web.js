import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import Reaptcha from 'reaptcha'

const Recaptcha = forwardRef(({ siteKey, onLoad, onVerify, onError, children, ...props }, ref) => {
  const captchaRef = useRef()
  const setCaptchaRef = useCallback(ref => (captchaRef.current = ref), [])
  const onExpired = useCallback(() => captchaRef.current.reset(), [])

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
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpired}
      />
      {children}
    </>
  )
})

export default Recaptcha
