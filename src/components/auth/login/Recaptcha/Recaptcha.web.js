import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import ReCAPTCHA from 'react-google-recaptcha'

const Recaptcha = forwardRef(({ siteKey, baseUrl, onStatusChange, children, ...props }, ref) => {
  const [recaptchaVisible, setRecaptchaVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    launch: () => setRecaptchaVisible(true),
  }))

  return !recaptchaVisible ? children : (
    <View style={styles.container}>
      <ReCAPTCHA
        {...props}
        sitekey={siteKey}
        onChange={onStatusChange}
        onErrored={onStatusChange}
        onExpired={onStatusChange}
        size="normal"
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
})

export default Recaptcha
