import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import usePromise from '../../../../lib/hooks/usePromise'
import Config from '../../../../config/config'

const { hcaptchaSiteKey } = Config

const Recaptcha = forwardRef(({ onVerify, onError, children }, ref) => {
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
        const { current: captcha } = captchaRef

        if (captcha) {
          captcha.resetCaptcha()
        }
      },
      type: () => {
        return 'hcaptcha'
      },
    }),
    [whenLoaded],
  )

  // this is needed because hcaptcha does not triggers onLoad is external script already loaded
  // it just renders and immediately sets isReady true
  useEffect(() => {
    const { current: captcha } = captchaRef

    if (captcha && captcha.isReady()) {
      setLoaded()
    }
  }, [setLoaded])

  return (
    <>
      <HCaptcha
        sitekey={hcaptchaSiteKey}
        onLoad={setLoaded}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpired}
        ref={captchaRef}
        size="invisible"
      />
      {children}
    </>
  )
})

export default Recaptcha
