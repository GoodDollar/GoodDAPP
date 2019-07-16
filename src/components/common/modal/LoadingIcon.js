// @flow
import React, { useEffect, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'

const LoadingIcon = props => {
  const [rotateValue] = useState(new Animated.Value(0))
  const { styles, style } = props
  const image = require('./img/LoadingIcon.png')

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        duration: 1500,
        toValue: 1,
        easing: Easing.linear,
        delay: 0,
      })
    ).start()
  }, [])

  return (
    <View style={[styles.loadingIconContainer, style]}>
      <Animated.Image
        style={[
          {
            transform: [
              {
                rotate: rotateValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
          styles.loadingIcon,
        ]}
        source={image}
      />
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    loadingIconContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: normalize(16),
    },
    loadingIcon: {
      height: normalize(90),
      width: normalize(90),
    },
  }
}

export default withStyles(getStylesFromProps)(LoadingIcon)
