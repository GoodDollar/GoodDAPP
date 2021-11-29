import { noop } from 'lodash'
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import Reaptcha from 'reaptcha'

import usePromise from '../../../../lib/hooks/usePromise'

const Recaptcha = forwardRef(({ siteKey, onLoad = noop, onVerify, onError, children, ...props }, ref) => {
  const captchaRef = useRef()
  const setCaptchaRef = useCallback(ref => (captchaRef.current = ref), [])
  const onExpired = useCallback(() => captchaRef.current.reset(), [])
  const [whenLoaded, setLoaded] = usePromise()

  const handleLoaded = () => setLoaded() && onLoad()

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
        onLoad={handleLoaded}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpired}
      />
      {children}
    </>
  )
})

export default Recaptcha
