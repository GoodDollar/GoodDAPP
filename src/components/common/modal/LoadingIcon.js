// @flow
import React, { useEffect, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import LoadingIconSVG from './img/LoadingIcon.svg'

const LoadingIcon = ({ styles, style, loadingIconStyle }) => {
  const [rotateValue] = useState(new Animated.Value(0))

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
      <Animated.View
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
          loadingIconStyle,
        ]}
      >
        <LoadingIconSVG />
      </Animated.View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  loadingIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.sizes.defaultDouble,
  },
  loadingIcon: {
    height: 90,
    width: 90,
  },
})

export default withStyles(getStylesFromProps)(LoadingIcon)
