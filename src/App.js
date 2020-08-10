// @flow
import { isMobile } from 'mobile-device-detect'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Platform, SafeAreaView, StyleSheet } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import './lib/gundb/gundb'
import { theme } from './components/theme/styles'
import SimpleStore, { setInitFunctions } from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector.web'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'
import Splash from './components/splash/Splash'
import isWebApp from './lib/utils/isWebApp'
import logger from './lib/logger/pino-logger'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import Config from './config/config'
import * as serviceWorker from './serviceWorker'
const log = logger.child({ from: 'App' })
let serviceWorkerRegistred = false
const DisconnectedSplash = () => <Splash animation={false} />

const SplashOrRouter = memo(({ store }) => {
  const isLoggedIn = !!store.get('isLoggedIn')
  const [showDesktopSplash, setShowDesktopSplash] = useState(Config.showSplashDesktop && isLoggedIn === false)
  const dismissDesktopSplash = useCallback(() => setShowDesktopSplash(false), [setShowDesktopSplash])

  return (
    <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={isLoggedIn}>
      {!isMobile && showDesktopSplash ? (
        <SplashDesktop onContinue={dismissDesktopSplash} urlForQR={window.location.href} />
      ) : (
        <RouterSelector />
      )}
    </InternetConnection>
  )
})

const App = () => {
  const store = SimpleStore.useStore()
  useEffect(() => {
    const onUpdate = reg => {
      store.set('serviceWorkerUpdated')(reg)
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        log.debug('service worker: controllerchange')
        window.location.reload()
      })
    }
    const onRegister = reg => {
      //force check for service worker update
      reg.update()
      if (reg.waiting) {
        onUpdate(reg)
      }
    }
    if (serviceWorkerRegistred === false) {
      log.debug('registering service worker')
      serviceWorker.register({ onRegister, onUpdate })
      serviceWorkerRegistred = true
    }
    if (isWebApp === false) {
      log.debug('useEffect, registering beforeinstallprompt')

      window.addEventListener('beforeinstallprompt', e => {
        // For older browsers
        e.preventDefault()
        log.debug('Install Prompt fired')
        store.set('installPrompt')(e)
      })
    }
    setInitFunctions(store.set('wallet'), store.set('userStorage'))
  }, [])

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
