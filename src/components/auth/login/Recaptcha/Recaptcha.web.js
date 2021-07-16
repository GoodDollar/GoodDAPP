import React, { forwardRef, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import ReCAPTCHA from 'react-google-recaptcha'

const Recaptcha = forwardRef(({ siteKey, baseUrl, onStatusChange, ...props }, ref) => {
  const captchaRef = useRef()

  return (
    <View style={styles.container}>
      <ReCAPTCHA
        {...props}
        ref={captchaRef}
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
