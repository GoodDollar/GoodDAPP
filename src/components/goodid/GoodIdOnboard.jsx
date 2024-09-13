import React, { useCallback, useContext } from 'react'
import { View } from 'react-native'
import { GoodIdProvider, OnboardController } from '@gooddollar/good-design'
import { GoodWalletContext } from '../../lib/wallet/GoodWalletProvider'
import { withStyles } from '../../lib/styles'
import Config from '../../config/config'

const GoodIdOnboardImpl = ({ screenProps, styles }) => {
  // isValid is result from FV
  const { navigateTo, isValid } = screenProps
  const { goodWallet } = useContext(GoodWalletContext)

  const navigateToFV = useCallback(() => {
    navigateTo('FaceVerificationIntro')
  }, [navigateTo])

  // passing isValid=true to Claim screen will automatically trigger the claim
  const onSkip = useCallback(() => {
    navigateTo('ClaimPage', { isValid })
  }, [navigateTo])

  const onExit = useCallback(() => {
    navigateTo('Home')
  }, [navigateTo])

  return (
    <View style={styles.wrapper}>
      <GoodIdProvider>
        <OnboardController
          account={goodWallet.account}
          withNavBar
          onFV={navigateToFV}
          onSkip={onSkip}
          onDone={onSkip}
          onExit={onExit}
          isDev={Config.env !== 'production'}
          isWallet={true}
        />
      </GoodIdProvider>
    </View>
  )
}
const getStylesFromProps = ({ theme }) => {
  return {
    wrapper: {
      alignItems: 'center',
    },
  }
}

export const GoodIdOnboard = withStyles(getStylesFromProps)(GoodIdOnboardImpl)

GoodIdOnboard.navigationOptions = { title: 'GoodID', navigationBarHidden: true }
