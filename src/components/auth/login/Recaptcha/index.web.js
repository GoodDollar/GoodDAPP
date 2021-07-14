import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'Recaptcha web' })

const Recaptcha = React.forwardRef((props, ref) => {
  const onChange = value => {
    log.debug('onChange', value)
    if (value) {
      props.onSuccess()
    }
  }

  const onErrored = value => {
    log.debug('onErrored', value)
  }

  const onExpired = value => {
    log.debug('onExpired', value)
  }

  return (
    <ReCAPTCHA
      ref={ref}
      sitekey="6LejsqwZAAAAAGsmSDWH5g09dOyNoGMcanBllKPF"
      onChange={onChange}
      onErrored={onErrored}
      onExpired={onExpired}
      size="invisible"
    />
  )
})

export default Recaptcha
