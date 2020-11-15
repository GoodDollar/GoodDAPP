import React from 'react'
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
import AddWebApp from './components/common/view/AddWebApp'
import isWebApp from './lib/utils/isWebApp'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import Blurred from './components/common/view/Blurred'
import Splash from './components/splash/Splash'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'

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
  // clear the active dialog state when the route is changing to prevent infinite blurred background
  // for example: when pressing browser history back button while feed card is opened - the route will be changed, but dialogData is still inside undux store
  const navigationStateHandler = useNavigationStateHandler()

  return (
    <GDStore.Container>
      <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={true}>
        {!isWebApp && <AddWebApp />}
        <Portal.Host>
          <Blurred whenDialog>
            <WebRouter onNavigationStateChange={navigationStateHandler} />
          </Blurred>
        </Portal.Host>
      </InternetConnection>
    </GDStore.Container>
  )
}

export default Router
