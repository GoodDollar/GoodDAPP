import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import usePromise from '../../../../lib/hooks/usePromise'
import Config from '../../../../config/config'

const { hcaptchaSiteKey } = Config

const Recaptcha = forwardRef(({ onVerify, onError, children, ...props }, ref) => {
  const captchaRef = useRef()
  const onExpired = useCallback(() => captchaRef.current.reset(), [])
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
        sitekey={hcaptchaSiteKey}
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
