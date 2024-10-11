// @flow
import React, { useContext } from 'react'
import { Animated, Platform, View } from 'react-native'
import { noop } from 'lodash'
import { t } from '@lingui/macro'

import { useFlagWithPayload } from '../../../lib/hooks/useFeatureFlags'
import { GoodWalletContext } from '../../../lib/wallet/GoodWalletProvider'
import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'
import Config from '../../../config/config'

const getStylesFromProps = ({ theme }) => ({
  inQueue: {
    backgroundColor: theme.colors.orange,
  },
  claimButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
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

const ClaimButton = withStyles(getStylesFromProps)(({
  screenProps,
  styles,
  style = {},
  onStatusChange = noop,
  onPress,
}) => {
  const isPending = false
  const canContinue = () => true

  const { goodWallet } = useContext(GoodWalletContext)
  const payload = useFlagWithPayload('uat-goodid-flow')
  const { whitelist } = payload

  // if there's no status the first time then get it
  // otherwise just return true.
  // in case we already have status then button is disabled if pending so its ok to return true here.
  // const canContinue = useMemo(() => (queueStatus ? constant(true) : handleClaim), [handleClaim, queueStatus])

  // useEffect(() => void onStatusChange(queueStatus), [status])

  return (
    <PushButton
      disabled={isPending}
      canContinue={canContinue}
      routeName={Config.env === 'development' || whitelist.includes(goodWallet.account) ? 'GoodIdOnboard' : 'Claim'}
      testID="claim_button"
      screenProps={screenProps}
      style={[styles.claimButton, isPending ? styles.inQueue : undefined, style]}
      contentStyle={styles.removeMargin}
      {...(onPress && { onPress: onPress })}
    >
      {isPending ? t`Queue` : t`Claim`}
    </PushButton>
  )
})

const AnimatedClaimButton = ({ screenProps, styles, animated, animatedScale, buttonStyles, onPress }) => {
  const button = <ClaimButton screenProps={screenProps} style={buttonStyles} onPress={onPress} />

  return (
    <View style={styles.wrapper}>
      {animated ? <Animated.View style={[animatedScale, styles.animatedWrapper]}>{button}</Animated.View> : button}
    </View>
  )
}

export default withStyles(getStylesFromProps)(AnimatedClaimButton)
