import React, { useCallback, useContext } from 'react'
import { ClaimProvider, ClaimWizard, GoodIdProvider } from '@gooddollar/good-design'
import { NewsFeedProvider, SupportedChains } from '@gooddollar/web3sdk-v2'
import { noop } from 'lodash'
import { View } from 'react-native'

import Config from '../../config/config'
import { GoodWalletContext, useSwitchNetwork } from '../../lib/wallet/GoodWalletProvider'

import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const ClaimPageWrapper = ({ screenProps, styles }) => {
  const { goodWallet } = useContext(GoodWalletContext)
  const { navigateTo } = screenProps
  const { switchNetwork } = useSwitchNetwork()

  const onUpgrade = useCallback(() => {
    navigateTo('GoodIdOnboard')
  }, [navigateTo])

  return (
    <View style={styles.wrapper}>
      <GoodIdProvider>
        <ClaimProvider explorerEndPoints={Config.goodIdExplorerUrls} onSwitchChain={switchNetwork} withNewsFeed={false}>
          <NewsFeedProvider env={'qa'} limit={1}>
            <ClaimWizard
              account={goodWallet.account}
              chainId={goodWallet.networkId}
              withSignModals
              supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
              onNews={noop}
              onUpgrade={onUpgrade}
              isDev={Config.env !== 'production'}
            />
          </NewsFeedProvider>
        </ClaimProvider>
      </GoodIdProvider>
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

export const ClaimPage = withStyles(getStylesFromProps)(ClaimPageWrapper)
ClaimPage.navigationOptions = { title: 'GoodID' }
