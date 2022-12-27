import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import usePromise from '../../../../lib/hooks/usePromise'

const Recaptcha = forwardRef(({ siteKey, onVerify, onError, children, ...props }, ref) => {
  const captchaRef = useRef()
  const onExpired = useCallback(() => captchaRef.current.resetCaptcha(), [])
  const [whenLoaded, setLoaded] = usePromise()

  useImperativeHandle(
    ref,
    () => ({
      launch: async () => {
        await whenLoaded
        captchaRef.current.execute()
      },
      reset: () => {
        captchaRef.current && captchaRef.current.resetCaptcha()
      },
      type: () => {
        return 'hcaptcha'
      },
    }),
    [whenLoaded],
  )

  return (
    <>
      <HCaptcha
        sitekey={siteKey}
        onLoad={setLoaded}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpired}
        ref={captchaRef}
        {...props}
        size="invisible"
      />
      {children}
    </>
  )
})

export default Recaptcha
