// @flow
import React, { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'

const Fade = ({ show, style, children }) => {
  const [fadeAnim] = useState(new Animated.Value(0))

  const easingIn = Easing.in(Easing.quad)
  const easingOut = Easing.out(Easing.quad)

  useEffect(() => {
    if (show) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: easingOut,
      }).start()
    } else {
      return Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        easing: easingIn,
      }).start()
    }
  }, [show])

  return (
    <Animated.View
      style={{
        ...style,
        opacity: fadeAnim,
      }}
    >
      {children}
    </Animated.View>
  )
}

export default Fade
