import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import Config from '../../../../config/config'

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
      sitekey={Config.recaptchaSiteKey}
      onChange={onChange}
      onErrored={props.onFail}
      onExpired={props.onFail}
      size="invisible"
    />
  )
})

export default Recaptcha
