// @flow
import React, { Fragment } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { PostHogProvider } from 'posthog-react-native'

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

  return (
    <PaperProvider theme={theme}>
      <AppWrapper {...wrapperProps}>
        <Fragment>
          <PostHogProvider
            apiKey={Config.posthogApiKey}
            options={{ host: Config.posthogHost, sendFeatureFlagEvent: false }}
            autocapture={false}
          >
            <GlobalTogglesContextProvider>
              <DialogContextProvider>
                <SimpleStoreDialog />
                <LoadingIndicator />
                <AppRouter />
              </DialogContextProvider>
            </GlobalTogglesContextProvider>
          </PostHogProvider>
        </Fragment>
      </AppWrapper>
    </PaperProvider>
  )
}

export default App
