import React, { useCallback, useContext } from 'react'
import { ClaimProvider, ClaimWizard, GoodIdProvider } from '@gooddollar/good-design'
import { NewsFeedProvider, SupportedChains } from '@gooddollar/web3sdk-v2'
import { noop } from 'lodash'
import { Platform, View } from 'react-native'
import { t } from '@lingui/macro'
import moment from 'moment'

import AsyncStorage from '../../lib/utils/asyncStorage'
import Config from '../../config/config'
import { GoodWalletContext, useSwitchNetwork } from '../../lib/wallet/GoodWalletProvider'
import { useFlagWithPayload } from '../../lib/hooks/useFeatureFlags'
import { useDialog } from '../../lib/dialog/useDialog'
import TaskDialog from '../common/dialogs/TaskDialog'

import { withStyles } from '../../lib/styles'

import SpinnerCheckMark from '../common/animations/SpinnerCheckMark/SpinnerCheckMark'

export const LoadingAnimation = ({ success, speed = 3 }) => (
  <View style={{ alignItems: 'center' }}>
    <SpinnerCheckMark
      successSpeed={speed}
      success={success}
      width={145}
      marginTop={Platform.select({ web: undefined, default: 5 })}
    />
  </View>
)

const ClaimPageWrapper = ({ screenProps, styles }) => {
  const { goodWallet } = useContext(GoodWalletContext)
  const { navigateTo } = screenProps
  const { switchNetwork } = useSwitchNetwork()
  const { showDialog } = useDialog()

  const payload = useFlagWithPayload('next-tasks')

  const { tasks } = payload

  const onClaimSuccess = useCallback(async () => {
    const today = moment().format('YYYY-MM-DD')
    const shownTasksToday = await AsyncStorage.getItem('shownTasksToday')

    if (shownTasksToday === today) {
      return
    }

    await AsyncStorage.setItem('shownTasksToday', today)

    await showDialog({
      image: <LoadingAnimation success speed={2} />,
      content: <TaskDialog tasks={tasks} />,
      title: t`You've claimed today!`,
      titleStyle: { paddingTop: 0, marginTop: 0, minHeight: 'auto' },
      onDismiss: noop,
      showButtons: false,
    })
  }, [showDialog])

  const onUpgrade = useCallback(() => {
    navigateTo('GoodIdOnboard')
  }, [navigateTo])

  const onExit = useCallback(() => {
    navigateTo('Home')
  }, [navigateTo])

  return (
    <View style={styles.wrapper}>
      <GoodIdProvider>
        <ClaimProvider
          activePoolAddresses={Config.UBIPoolAddresses}
          explorerEndPoints={Config.goodIdExplorerUrls}
          onSwitchChain={switchNetwork}
          withNewsFeed={false}
          onSuccess={onClaimSuccess}
          onUpgrade={onUpgrade}
        >
          <NewsFeedProvider env={'qa'} limit={1}>
            <ClaimWizard
              account={goodWallet.account}
              chainId={goodWallet.networkId}
              withSignModals
              supportedChains={[SupportedChains.CELO, SupportedChains.FUSE]}
              onNews={noop}
              onExit={onExit}
              isDev={Config.env !== 'production'}
              withNavBar={true}
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
    },
  }
}

export const ClaimPage = withStyles(getStylesFromProps)(ClaimPageWrapper)
ClaimPage.navigationOptions = { title: 'Claim', navigationBarHidden: true }
