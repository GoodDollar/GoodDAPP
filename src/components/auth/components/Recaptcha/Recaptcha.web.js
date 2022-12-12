import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import HCaptchaWeb from '@hcaptcha/react-hcaptcha'
import RecaptchaWeb from 'reaptcha'

import usePromise from '../../../../lib/hooks/usePromise'

const Recaptcha = forwardRef(({ siteKey, type = 'recaptcha', onVerify, onError, children, ...props }, ref) => {
  const captchaRef = useRef()
  const [whenLoaded, setLoaded] = usePromise()
  const setCaptchaRef = useCallback(ref => (captchaRef.current = ref), [])

  const resetCaptcha = useCallback(() => {
    const { current: captcha } = captchaRef

    if (captcha) {
      captcha.reset()
    }
  }, [])

  const isReCaptcha = type === 'recaptcha'
  const Captcha = isReCaptcha ? RecaptchaWeb : HCaptchaWeb

  useImperativeHandle(
    ref,
    () => ({
      launch: async () => {
        await whenLoaded
        captchaRef.current.execute()
      },

      reset: () => {
        resetCaptcha()
      },
    }),
    [whenLoaded, resetCaptcha],
  )

  return (
    <>
      <Captcha
        ref={isReCaptcha ? setCaptchaRef : captchaRef}
        onExpire={resetCaptcha}
        onVerify={onVerify}
        onLoad={setLoaded}
        onError={onError}
        sitekey={siteKey}
        {...props}
        size="invisible"
      />
      {children}
    </>
  )
})

export default Recaptcha
