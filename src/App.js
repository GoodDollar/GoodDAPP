// @flow
import { isMobile } from 'mobile-device-detect'
import React, { memo, useCallback, useState } from 'react'
import { Platform, SafeAreaView, StyleSheet } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
import './lib/gundb/gundb'
import useServiceWorker from './lib/hooks/useServiceWorker'
import { theme } from './components/theme/styles'
import SimpleStore from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector.web'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'
import logger from './lib/logger/pino-logger'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import Config from './config/config'
const log = logger.child({ from: 'App' })

const SplashOrRouter = memo(({ store }) => {
  const isLoggedIn = !!store.get('isLoggedIn')
  const [showDesktopSplash, setShowDesktopSplash] = useState(Config.showSplashDesktop && isLoggedIn === false)
  const dismissDesktopSplash = useCallback(() => setShowDesktopSplash(false), [setShowDesktopSplash])

  return !isMobile && showDesktopSplash ? (
    <SplashDesktop onContinue={dismissDesktopSplash} urlForQR={window.location.href} />
  ) : (
    <RouterSelector />
  )
})

const App = () => {
  useServiceWorker()
  log.debug({ Config })
  const store = SimpleStore.useStore()

  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeAreaView}>
        <React.Fragment>
          <SimpleStoreDialog />
          <LoadingIndicator />
          <SplashOrRouter store={store} />
        </React.Fragment>
      </SafeAreaView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

let hotWrapper = () => () => App
if (Platform.OS === 'web') {
  const { hot } = require('react-hot-loader')
  hotWrapper = hot
}

//$FlowFixMe
export default hotWrapper(module)(App)
