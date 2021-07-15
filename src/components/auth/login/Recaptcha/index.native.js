import React from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'
import Config from '../../../../config/config'

const Recaptcha = React.forwardRef((props, ref) => {
  const onVerify = value => {
    if (value) {
      props.onSuccess()
    } else {
      props.onFail()
    }
  }

  return (
    <ReCAPTCHA
      ref={ref}
      siteKey={Config.recaptchaSiteKey}
      baseUrl={Config.recaptchaBaseUrl}
      size="normal"
      onExpire={props.onFail}
      onError={props.onFail}
      onVerify={onVerify}
    />
  )
})

export default Recaptcha
