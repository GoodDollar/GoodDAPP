import React, { useCallback } from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import { Portal } from 'react-native-paper'
import { navigationConfig } from './components/appNavigation/navigationConfig'
import About from './components/about/AboutState'

import BackupWallet from './components/backupWallet/BackupWalletState'
import ExportWallet from './components/backupWallet/ExportWalletData'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/appSwitch/AppSwitch'
import GDStore from './lib/undux/GDStore'
import { fireEventFromNavigation } from './lib/analytics/analytics'
import AddWebApp from './components/common/view/AddWebApp'
import isWebApp from './lib/utils/isWebApp'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import Splash from './components/splash/Splash'
import useResetBlurScreen from './lib/hooks/useResetBlurScreen'

const DisconnectedSplash = () => <Splash animation={false} />

const AppNavigator = createNavigator(
  AppSwitch,
  SwitchRouter(
    {
      About,

      BackupWallet,
      ExportWallet,
      AppNavigation,
    },
    {
      initialRouteName: 'AppNavigation',
    },
    navigationConfig,
  ),
  navigationConfig,
)
let WebRouter
if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(AppNavigator)
}

const Router = () => {
  const resetBlurScreen = useResetBlurScreen()
  const handleNavigationStateChange = useCallback(
    (prevNav, nav, action) => {
      fireEventFromNavigation(action)

      // when route changing - then hiding dialog and removing blur background effect
      resetBlurScreen()
    },
    [resetBlurScreen],
  )

  return (
    <GDStore.Container>
      <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={true}>
        {!isWebApp && <AddWebApp />}
        <Portal.Host>
          <WebRouter onNavigationStateChange={handleNavigationStateChange} />
        </Portal.Host>
      </InternetConnection>
    </GDStore.Container>
  )
}
export default Router
