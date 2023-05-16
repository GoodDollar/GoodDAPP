import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import Reaptcha from 'reaptcha'
import Config from '../../../../config/config'
import usePromise from '../../../../lib/hooks/usePromise'
const { recaptchaSiteKey } = Config

const Recaptcha = forwardRef(({ onVerify, onError, children, ...props }, ref) => {
  const captchaRef = useRef()
  const setCaptchaRef = useCallback(ref => (captchaRef.current = ref), [])
  const onExpired = useCallback(() => captchaRef.current.reset(), [])
  const [whenLoaded, setLoaded] = usePromise()

  useImperativeHandle(
    ref,
    () => ({
      launch: async () => {
        await whenLoaded
        captchaRef.current.execute()
      },
      reset: () => captchaRef.current && captchaRef.current.reset(),
      type: () => {
        return 'recaptcha'
      },
    }),
    [whenLoaded],
  )

  return (
    <>
      <Reaptcha
        {...props}
        ref={setCaptchaRef}
        sitekey={recaptchaSiteKey}
        size="invisible"
        onLoad={setLoaded}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpired}
      />
      {children}
    </>
  )
})

export default Recaptcha
