// @flow
import React, { Fragment } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { SimpleStoreDialog } from '../components/common/dialogs/CustomDialog'
import LoadingIndicator from '../components/common/view/LoadingIndicator'

import FVRouter from '../FVRouter'

import { isMobile } from '../lib/utils/platform'
import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import logger from '../lib/logger/js-logger'

import { theme } from '../components/theme/styles'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'

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

  return (
    <PaperProvider theme={theme}>
      <AppWrapper {...wrapperProps}>
        <Fragment>
          <GlobalTogglesContextProvider>
            <DialogContextProvider>
              <GoodWalletProvider>
                <SimpleStoreDialog />
                <LoadingIndicator />
                <FVRouter />
              </GoodWalletProvider>
            </DialogContextProvider>
          </GlobalTogglesContextProvider>
        </Fragment>
      </AppWrapper>
    </PaperProvider>
  )
}

export default App
