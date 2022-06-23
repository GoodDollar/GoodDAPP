// @flow
import React, { Fragment } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { SimpleStoreDialog } from '../components/common/dialogs/CustomDialog'
import LoadingIndicator from '../components/common/view/LoadingIndicator'

import RouterSelector from '../RouterSelector'

import useServiceWorker from '../lib/hooks/useServiceWorker'

import { isMobile } from '../lib/utils/platform'
import logger from '../lib/logger/js-logger'

import { theme } from '../components/theme/styles'
import AppContext from './AppContext'

// eslint-disable-next-line no-unused-vars
const log = logger.child({ from: 'App' })

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

// export for unit testing
const App = () => {
  const AppWrapper = isMobile ? Fragment : SafeAreaView
  const wrapperProps = isMobile ? {} : { style: styles.safeAreaView }
  useServiceWorker() // Only runs on Web

  // useEffect(() => {
  //   log.debug('on mount')

  //   const { _v8runtime: v8 } = global

  //   log.debug({ Config })

  //   if (isAndroidNative && v8) {
  //     log.debug(`V8 version is ${v8().version}`)
  //   }
  // }, [])

  return (
    <PaperProvider theme={theme}>
      <AppWrapper {...wrapperProps}>
        <AppContext>
          <SimpleStoreDialog />
          <LoadingIndicator />
          <RouterSelector />
        </AppContext>
      </AppWrapper>
    </PaperProvider>
  )
}

export default App
