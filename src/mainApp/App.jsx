// @flow
import React, { Fragment } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { WalletChatProvider } from 'react-native-wallet-chat'
import { NativeBaseProvider, theme as NBTheme } from '@gooddollar/good-design'

import { SimpleStoreDialog } from '../components/common/dialogs/CustomDialog'
import LoadingIndicator from '../components/common/view/LoadingIndicator'

import RouterSelector from '../RouterSelector'

import { isMobile } from '../lib/utils/platform'
import logger from '../lib/logger/js-logger'

import { theme } from '../components/theme/styles'
import Config from '../config/config'
import AppContext from './AppContext'

// eslint-disable-next-line no-unused-vars
const log = logger.child({ from: 'App' })

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

// export for unit testing
export const App = () => {
  const AppWrapper = isMobile ? Fragment : SafeAreaView
  const wrapperProps = isMobile ? {} : { style: styles.safeAreaView }
  log.debug({ Config })
  return (
    <NativeBaseProvider theme={NBTheme}>
      <PaperProvider theme={theme}>
        <AppWrapper {...wrapperProps}>
          <WalletChatProvider>
            <AppContext>
              <SimpleStoreDialog />
              <LoadingIndicator />
              <RouterSelector />
            </AppContext>
          </WalletChatProvider>
        </AppWrapper>
      </PaperProvider>
    </NativeBaseProvider>
  )
}
