import React from 'react'
import { ClaimProvider, ClaimWizard } from '@gooddollar/good-design'
import { NewsFeedProvider, SupportedChains } from '@gooddollar/web3sdk-v2'
import { noop } from 'lodash'
import { View } from 'react-native'

import Config from '../../config/config'
import { useSwitchNetwork } from '../../lib/wallet/GoodWalletProvider'

import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const ClaimPageWrapper = ({ styles }) => {
  const { switchNetwork } = useSwitchNetwork()

  return (
    <View style={styles.wrapper}>
      <ClaimProvider explorerEndPoints={Config.goodIdExplorerUrls} onSwitchChain={switchNetwork} withNewsFeed={false}>
        <NewsFeedProvider env={'qa'} limit={1}>
          <ClaimWizard withSignModals supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]} onNews={noop} />
        </NewsFeedProvider>
      </ClaimProvider>
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
