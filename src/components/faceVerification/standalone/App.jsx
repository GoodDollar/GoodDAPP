// @flow
import React, { Fragment } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { PostHogProvider } from 'posthog-react-native'
import { Celo, Web3Provider as GoodWeb3Provider } from '@gooddollar/web3sdk-v2'
import { ethers } from 'ethers'

import { SimpleStoreDialog } from '../../common/dialogs/CustomDialog'
import LoadingIndicator from '../../common/view/LoadingIndicator'

import { isMobile } from '../../../lib/utils/platform'
import { GlobalTogglesContextProvider } from '../../../lib/contexts/togglesContext'
import { DialogContextProvider } from '../../../lib/dialog/dialogContext'
import logger from '../../../lib/logger/js-logger'

import { theme } from '../../theme/styles'
import Config from '../../../config/config'

import AppRouter from './AppRouter'

// eslint-disable-next-line no-unused-vars
const log = logger.child({ from: 'FV APP' })

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

// export for unit testing
const App = () => {
  const AppWrapper = isMobile ? Fragment : SafeAreaView
  const wrapperProps = isMobile ? {} : { style: styles.safeAreaView }
  const web3Provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org')

  let env = Config.network.split('-')[0] === 'development' ? 'fuse' : Config.network.split('-')[0]
  if (['fuse', 'staging', 'production'].includes(env) === false) {
    env = 'fuse'
  }

  const props = {
    web3Provider,
    env,
    config: {
      pollingInterval: 15000,
      networks: [Celo],
      readOnlyChainId: undefined,
      readOnlyUrls: {
        1: 'https://rpc.ankr.com/eth',
        122: 'https://rpc.fuse.io',
        42220: 'https://forno.celo.org',
      },
    },
  }

  return (
    <PaperProvider theme={theme}>
      <AppWrapper {...wrapperProps}>
        <Fragment>
          <PostHogProvider
            apiKey={Config.posthogApiKey}
            options={{ host: Config.posthogHost, sendFeatureFlagEvent: false }}
            autocapture={false}
          >
            <GoodWeb3Provider {...props}>
              <GlobalTogglesContextProvider>
                <DialogContextProvider>
                  <SimpleStoreDialog />
                  <LoadingIndicator />
                  <AppRouter />
                </DialogContextProvider>
              </GlobalTogglesContextProvider>
            </GoodWeb3Provider>
          </PostHogProvider>
        </Fragment>
      </AppWrapper>
    </PaperProvider>
  )
}

export default App
