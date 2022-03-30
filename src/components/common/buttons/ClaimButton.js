// @flow
import React from 'react'
import { Animated, Platform, View } from 'react-native'
import { noop } from 'lodash'

import { t } from '@lingui/macro'
import { PushButton } from '../../appNavigation/PushButton'

// import useClaimQueue from '../../dashboard/Claim/useClaimQueue'

import { withStyles } from '../../../lib/styles'

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
    marginHorizontal: 0,
    elevation: 0,
    padding: 3,
    position: 'absolute',
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

const ClaimButton = withStyles(getStylesFromProps)(({ screenProps, styles, style = {}, onStatusChange = noop }) => {
  // const { queueStatus, handleClaim } = useClaimQueue()
  // const { status } = queueStatus || {}
  const isPending = false
  const canContinue = () => true

  // if there's no status the first time then get it
  // otherwise just return true.
  // in case we already have status then button is disabled if pending so its ok to return true here.
  // const canContinue = useMemo(() => (queueStatus ? constant(true) : handleClaim), [handleClaim, queueStatus])

  // useEffect(() => void onStatusChange(queueStatus), [status])

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
      {isPending ? t`Queue` : t`Claim`}
    </PushButton>
  )
})

const AnimatedClaimButton = ({ screenProps, styles, animated, animatedScale }) => {
  const button = <ClaimButton screenProps={screenProps} />

  return (
    <View style={styles.wrapper}>
      {animated ? <Animated.View style={[animatedScale, styles.animatedWrapper]}>{button}</Animated.View> : button}
    </View>
  )
}

export default withStyles(getStylesFromProps)(AnimatedClaimButton)
