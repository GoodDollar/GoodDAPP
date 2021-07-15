import React from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'

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
      siteKey="6LejsqwZAAAAAGsmSDWH5g09dOyNoGMcanBllKPF"
      baseUrl="http://127.0.0.1"
      size="normal"
      onExpire={props.onFail}
      onError={props.onFail}
      onVerify={onVerify}
    />
  )
})

export default Recaptcha
