// @flow
import { isMobile } from 'mobile-device-detect'
import React, { useEffect, useState, Fragment } from 'react'
import { AsyncStorage, SafeAreaView, StyleSheet, Text } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import { theme } from './components/theme/styles'
import SimpleStore, { initStore, setInitFunctions } from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector.web'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'
import Splash from './components/splash/Splash'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import useServiceWorker from './lib/utils/useServiceWorker'
import Config from './config/config'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'

const App = () => {
  useServiceWorker() // Only runs on Web
  const store = SimpleStore.useStore()

  useEffect(() => {
    setInitFunctions(store.set('wallet'), store.set('userStorage'))
  }, [store])

  const [useDesktop, setUseDesktop] = useState(store.get('isLoggedIn') === true)

  const continueWithDesktop = () => {
    setUseDesktop(true)
  }

  const SplashOrRouter =
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
          <InternetConnection onDisconnect={() => <Splash />}>
            {SplashOrRouter}
            {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
          </InternetConnection>
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

let ErrorBoundary = React.Fragment

const AppHolder = () => {
  const [ready, setReady] = useState(false)

  useEffect( () => {
    if (Config.bugsnagKey) {
      const bugsnagClient = bugsnag({
        apiKey: Config.bugsnagKey,
        appVersion: Config.version,
        releaseStage: Config.env + '_' + Config.network,
      })
      global.bugsnagClient = bugsnagClient
      bugsnagClient.metaData = { network: Config.network }
      bugsnagClient.use(bugsnagReact, React)
      ErrorBoundary = bugsnagClient.getPlugin('react')
    }

    /**
     * decide if we need to clear storage
     */
    const upgradeVersion = async () => {
      const valid = ['etoro', 'beta.11']
      const required = Config.isEToro ? 'etoro' : 'beta.11'
      const version = await AsyncStorage.getItem('GD_version')
      if (valid.includes(version)) {
        return
      }
      await AsyncStorage.clear()
      return AsyncStorage.setItem('GD_version', required)
    }

    (async () => {
      await upgradeVersion()
      await initStore()
      setReady(true)
    })()
  }, [])

  if (!ready) {
    return null
  }

  return (
    <ErrorBoundary>
      <SimpleStore.Container>
        <App />
      </SimpleStore.Container>
    </ErrorBoundary>
  )
}

export default AppHolder
