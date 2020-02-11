// @flow
import React, { useCallback } from 'react'
import { Animated, Platform, View } from 'react-native'
import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'

const ClaimButton = ({ screenProps, styles, animated }) => {
  const [containerSize, setContainerSize] = React.useState([])

  const Button = (
    <PushButton
      routeName="Claim"
      testID="claim_button"
      screenProps={screenProps}
      style={[styles.claimButton, { transform: containerSize }]}
      contentStyle={{ marginHorizontal: -16 }}
    >
      Claim
    </PushButton>
  )

  return (
    <View
      style={styles.wrapper}
      onLayout={useCallback(event => {
        const { width, height } = event.nativeEvent.layout
        setContainerSize([{ translateY: -width / 2 }, { translateX: -height / 2 }])
      }, [])}
    >
      {animated ? <Animated.View>{Button}</Animated.View> : Button}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  claimButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.green,
    borderColor: theme.colors.surface,
    borderRadius: Platform.select({
      default: 72 / 2,
      web: '50%',
    }),
    borderWidth: 3,
    height: 72,
    left: '50%',
    marginHorizontal: 0,
    elevation: 0,
    padding: 3,
    position: 'absolute',
    top: '50%',
    width: 72,
    zIndex: 99,
  },
  wrapper: {
    height: '100%',
    zIndex: 1,
  },
})

export default withStyles(getStylesFromProps)(ClaimButton)
