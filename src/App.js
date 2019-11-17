// @flow
import { isMobile } from 'mobile-device-detect'
import React, { useEffect, useState } from 'react'
import { Platform, SafeAreaView, StyleSheet } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import { theme } from './components/theme/styles'
import SimpleStore from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector.web'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'
import isWebApp from './lib/utils/isWebApp'
import logger from './lib/logger/pino-logger'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'

const log = logger.child({ from: 'App' })

const App = () => {
  const store = SimpleStore.useStore()
  useEffect(() => {
    if (isWebApp === false) {
      log.debug('useEffect, registering beforeinstallprompt')

      window.addEventListener('beforeinstallprompt', e => {
        // For older browsers
        e.preventDefault()
        log.debug('Install Prompt fired')
        store.set('installPrompt')(e)
      })
    }
  }, [])

  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }
  const [useDesktop, setUseDesktop] = useState(store.get('isLoggedIn') === true)

  const continueWithDesktop = () => {
    setUseDesktop(true)
  }

  const Splash =
    !isMobile && !useDesktop ? (
      <SplashDesktop onContinue={continueWithDesktop} urlForQR={window.location.href} />
    ) : (
      <RouterSelector />
    )

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeAreaView}>
        <React.Fragment>
          <SimpleStoreDialog />
          <LoadingIndicator />
          <InternetConnection />
          {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
          {Splash}
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
