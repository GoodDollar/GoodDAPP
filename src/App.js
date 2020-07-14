// @flow
import React, { Fragment, memo, useCallback, useEffect, useState } from 'react'
import { Platform, SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import AsyncStorage from './lib/utils/asyncStorage'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import { isMobile } from './lib/utils/platform'
import './lib/gundb/gundb'
import { theme } from './components/theme/styles'
import SimpleStore, { initStore, setInitFunctions } from './lib/undux/SimpleStore'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'
import Splash from './components/splash/Splash'
import isWebApp from './lib/utils/isWebApp'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import useServiceWorker from './lib/utils/useServiceWorker'
import Config from './config/config'
import RouterSelector from './RouterSelector'
import logger from './lib/logger/pino-logger'
import { deleteGunDB } from './lib/hooks/useDeleteAccountDialog'
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
  useServiceWorker() // Only runs on Web
  log.debug({ Config })
  const store = SimpleStore.useStore()

  useEffect(() => {
    if (!isMobile) {
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
    }
    setInitFunctions(store.set('wallet'), store.set('userStorage'))
  }, [])

  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }

  const AppWrapper = isMobile ? Fragment : SafeAreaView

  return (
    <PaperProvider theme={theme}>
      <AppWrapper style={styles.safeAreaView}>
        <Fragment>
          <SimpleStoreDialog />
          <LoadingIndicator />
          <SplashOrRouter store={store} />
        </Fragment>
      </AppWrapper>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

const AppHolder = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    /**
     * decide if we need to clear storage
     */
    /**
     * decide if we need to clear storage
     */
    const upgradeVersion = async () => {
      const valid = ['etoro', 'phase0-a']
      const required = Config.isEToro ? 'etoro' : 'phase0-a'
      const version = await AsyncStorage.getItem('GD_version')
      if (version == null || valid.includes(version)) {
        return
      }
      const req = deleteGunDB()

      //remove all local data so its not cached and user will re-login
      await Promise.all([AsyncStorage.clear(), req.catch()])
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
      <SimpleStore.Container>
        <App />
      </SimpleStore.Container>
    </ActionSheetProvider>
  )
}

export default AppHolder
