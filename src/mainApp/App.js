// @flow

import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { SimpleStoreDialog } from '../components/common/dialogs/CustomDialog'
import LoadingIndicator from '../components/common/view/LoadingIndicator'
import SplashDesktop from '../components/splash/SplashDesktop'

import RouterSelector from '../RouterSelector'

import { useCountryCode } from '../lib/hooks/useCountryFlagUrl'
import useServiceWorker from '../lib/hooks/useServiceWorker'

import SimpleStore from '../lib/undux/SimpleStore'

import { isMobile } from '../lib/utils/platform'
import Config from '../config/config'
import logger from '../lib/logger/pino-logger'
import { theme } from '../components/theme/styles'

const log = logger.child({ from: 'App' })

const SplashOrRouter = ({ store }) => {
  const [showDesktopSplash, setShowDesktopSplash] = useState(() => {
    if (isMobile) {
      return false
    }

    const isGuest = !(store && store.get('isLoggedIn'))

    return Config.showSplashDesktop && isGuest
  })

  const dismissDesktopSplash = useCallback(() => setShowDesktopSplash(false), [setShowDesktopSplash])

  return showDesktopSplash ? (
    <SplashDesktop onContinue={dismissDesktopSplash} urlForQR={window.location.href} />
  ) : (
    <RouterSelector />
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

// export for unit testing
export const App = () => {
  const store = SimpleStore.useStore()
  const AppWrapper = isMobile ? Fragment : SafeAreaView
  const wrapperProps = isMobile ? {} : { style: styles.safeAreaView }

  useCountryCode()
  useServiceWorker() // Only runs on Web
  useEffect(() => log.debug({ Config }), [])

  return (
    <PaperProvider theme={theme}>
      <AppWrapper {...wrapperProps}>
        <Fragment>
          <SimpleStoreDialog />
          <LoadingIndicator />
          <SplashOrRouter store={store} />
        </Fragment>
      </AppWrapper>
    </PaperProvider>
  )
}
