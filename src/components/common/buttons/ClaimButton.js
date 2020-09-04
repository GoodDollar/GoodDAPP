// @flow
import React, { useCallback, useMemo } from 'react'
import { Animated, Platform, View } from 'react-native'
import { constant, get } from 'lodash'

import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'
import useClaimQueue from '../../dashboard/Claim/useClaimQueue'

const getStylesFromProps = ({ theme }) => ({
  inQueue: {
    backgroundColor: theme.colors.orange,
  },
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

const ClaimButton = withStyles(getStylesFromProps)(({ screenProps, styles, style = {} }) => {
  const { queueStatus, handleClaim } = useClaimQueue()
  const isPending = get(queueStatus, 'status') === 'pending'

  // if there's no status the first time then get it
  // otherwise just return true.
  // in case we already have status then button is disabled if pending so its ok to return true here.
  const canContinue = useMemo(() => (queueStatus ? constant(true) : handleClaim), [handleClaim, queueStatus])

  return (
    <PushButton
      disabled={isPending}
      canContinue={canContinue}
      routeName="Claim"
      testID="claim_button"
      screenProps={screenProps}
      style={[styles.claimButton, isPending ? styles.inQueue : undefined, style]}
      contentStyle={styles.removeMargin}
    >
      {isPending ? 'Queue' : 'Claim'}
    </PushButton>
  )
})

const AnimatedClaimButton = ({ screenProps, styles, animated, animatedScale }) => {
  const [pushButtonTranslate, setPushButtonTranslate] = React.useState({})

  const handleLayout = useCallback(
    event => {
      const { width, height } = event.nativeEvent.layout

      setPushButtonTranslate({ translateY: -width / 2, translateX: -height / 2 })
    },
    [setPushButtonTranslate],
  )

  const animatedStyle = useMemo(() => {
    if (!animated) {
      return
    }

    return {
      transform: [
        { translateY: pushButtonTranslate.translateY || 0 },
        { translateX: pushButtonTranslate.translateX || 0 },
      ],
    }
  }, [pushButtonTranslate])

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {animated ? (
        <Animated.View style={[animatedScale, styles.animatedWrapper]}>
          <ClaimButton screenProps={screenProps} style={animatedStyle} />
        </Animated.View>
      ) : (
        <ClaimButton screenProps={screenProps} />
      )}
    </View>
  )
}

export default withStyles(getStylesFromProps)(AnimatedClaimButton)
