import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

const Recaptcha = React.forwardRef((props, ref) => {
  const onChange = value => {
    if (value) {
      props.onSuccess()
    } else {
      props.onFail()
    }
  }

  return (
    <ReCAPTCHA
      ref={ref}
      sitekey="6LejsqwZAAAAAGsmSDWH5g09dOyNoGMcanBllKPF"
      onChange={onChange}
      onErrored={props.onFail}
      onExpired={props.onFail}
      size="invisible"
    />
  )
})

export default Recaptcha
