import React, { useCallback, useContext } from 'react'
import { View } from 'react-native'
import { OnboardScreen } from '@gooddollar/good-design'
import { GoodWalletContext } from '../../lib/wallet/GoodWalletProvider'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'

const GoodIdOnboardImpl = ({ screenProps, styles }) => {
  // isValid is result from FV
  const { navigateTo, isValid } = screenProps
  const { goodWallet } = useContext(GoodWalletContext)

  const navigateToFV = useCallback(() => {
    navigateTo('FaceVerificationIntro')
  }, [navigateTo])

  // passing isValid=true to Claim screen will automatically trigger the claim
  const onSkip = useCallback(() => {
    navigateTo('Claim', { isValid })
  }, [navigateTo])

  return (
    <View style={styles.wrapper}>
      <OnboardScreen account={goodWallet.account} onFV={navigateToFV} onSkip={onSkip} />
    </View>
  )
}
const getStylesFromProps = ({ theme }) => {
  return {
    wrapper: {
      alignItems: 'center',
      marginTop: getDesignRelativeHeight(theme.sizes.default * 3),
    },
  }
}

export const GoodIdOnboard = withStyles(getStylesFromProps)(GoodIdOnboardImpl)
GoodIdOnboard.navigationOptions = { title: 'GoodID' }
