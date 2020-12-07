// @flow

import React, { Fragment, memo, useCallback, useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { SimpleStoreDialog } from '../components/common/dialogs/CustomDialog'
import { useCountryCode } from '../lib/hooks/useCountryFlagUrl'
import LoadingIndicator from '../components/common/view/LoadingIndicator'
import SplashDesktop from '../components/splash/SplashDesktop'
import { theme } from '../components/theme/styles'
import RouterSelector from '../RouterSelector'

import useServiceWorker from '../lib/hooks/useServiceWorker'

import Config from '../config/config'
import logger from '../lib/logger/pino-logger'
import SimpleStore from '../lib/undux/SimpleStore'
import { isMobile } from '../lib/utils/platform'

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

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

// export for unit testing
export const App = () => {
  const store = SimpleStore.useStore()
  useCountryCode()

  useServiceWorker() // Only runs on Web
  useEffect(() => log.debug({ Config }), [])

  const AppWrapper = isMobile ? Fragment : SafeAreaView
  const wrapperProps = isMobile ? {} : { style: styles.safeAreaView }

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
