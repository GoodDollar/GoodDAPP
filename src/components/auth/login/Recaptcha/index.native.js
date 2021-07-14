import React from 'react'
import ReCAPTCHA from 'react-native-recaptcha-that-works'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'Recaptcha native' })

const Recaptcha = React.forwardRef((props, ref) => {
  const onLoad = () => {
    log.debug('onLoad')
  }

  const onClose = () => {
    log.debug('onClose')
  }

  const onError = value => {
    log.debug('onError', value)
  }

  const onVerify = value => {
    log.debug('onVerify', value)
    if (value) {
      props.onSuccess()
    }
  }

  return (
    <ReCAPTCHA
      ref={ref}
      siteKey="6LejsqwZAAAAAGsmSDWH5g09dOyNoGMcanBllKPF"
      baseUrl="http://127.0.0.1"
      size="normal"
      onLoad={onLoad}
      onClose={onClose}
      onError={onError}
      onVerify={onVerify}
    />
  )
})

export default Recaptcha
