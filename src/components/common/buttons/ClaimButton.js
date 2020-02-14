// @flow
import React, { useCallback } from 'react'
import { Animated, Platform, View } from 'react-native'
import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'

const ClaimButton = ({ screenProps, styles, animated, animatedScale }) => {
  const [pushButtonTranslate, setPushButtonTranslate] = React.useState({})

  const Button = (
    <PushButton
      routeName="Claim"
      testID="claim_button"
      screenProps={screenProps}
      style={[
        styles.claimButton,
        {
          transform: [
            { translateY: pushButtonTranslate.translateY || 0 },
            { translateX: pushButtonTranslate.translateX || 0 },
          ],
        },
      ]}
      contentStyle={styles.removeMargin}
    >
      Claim
    </PushButton>
  )

  const handleLayout = useCallback(event => {
    const { width, height } = event.nativeEvent.layout
    setPushButtonTranslate({ translateY: -width / 2, translateX: -height / 2 })
  })

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {animated ? (
        <Animated.View
          style={[
            animatedScale,
            styles.animatedWrapper,
            { opacity: pushButtonTranslate.translateY || pushButtonTranslate.translateX ? 1 : 0 },
          ]}
        >
          {Button}
        </Animated.View>
      ) : (
        Button
      )}
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
    height: '100%',
    left: '50%',
    marginHorizontal: 0,
    elevation: 0,
    padding: 3,
    position: 'absolute',
    top: '50%',
    width: '100%',
    zIndex: 99,
  },
  animatedWrapper: {
    width: 72,
    height: 72,
  },
  wrapper: {
    zIndex: 1,
  },
  removeMargin: {
    marginHorizontal: -theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(ClaimButton)
