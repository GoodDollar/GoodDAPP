// @flow
import React, { useEffect, useMemo, useState } from 'react'
import { AsyncStorage, Platform } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { isMobile } from './lib/utils/platform'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import { theme } from './components/theme/styles'
import SimpleStore, { initStore, setInitFunctions } from './lib/undux/SimpleStore'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'
import Splash from './components/splash/Splash'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import useServiceWorker from './lib/utils/useServiceWorker'
import Config from './config/config'
import RouterSelector from './RouterSelector'
import { ErrorBoundary } from './lib/analytics/bugsnag'

const App = () => {
  useServiceWorker() // Only runs on Web
  const store = SimpleStore.useStore()
  const isLoggedIn = store.get('isLoggedIn')
  useEffect(() => {
    setInitFunctions(store.set('wallet'), store.set('userStorage'))
  }, [])

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

  return useMemo(
    () => (
      <PaperProvider theme={theme}>
        <SimpleStoreDialog />
        <LoadingIndicator />
        <InternetConnection onDisconnect={() => <Splash animation={false} />} isLoggedIn={isLoggedIn}>
          {SplashOrRouter}
          {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
        </InternetConnection>
      </PaperProvider>
    ),

    [isMobile, useDesktop, isLoggedIn]
  )
}

const AppHolder = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
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

    ;(async () => {
      if (Platform.OS === 'web') {
        await upgradeVersion()
      }

      await initStore()
      setReady(true)
    })()
  }, [])

  if (!ready) {
    return null
  }

  return (
    <ActionSheetProvider>
      <ErrorBoundary>
        <SimpleStore.Container>
          <App />
        </SimpleStore.Container>
      </ErrorBoundary>
    </ActionSheetProvider>
  )
}

export default AppHolder
