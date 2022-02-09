import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import Reaptcha from 'reaptcha'

import usePromise from '../../../../lib/hooks/usePromise'

const Recaptcha = forwardRef(({ siteKey, onVerify, onError, children, ...props }, ref) => {
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
    }),
    [whenLoaded],
  )

  return (
    <>
      <Reaptcha
        {...props}
        ref={setCaptchaRef}
        sitekey={siteKey}
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
