// @flow
import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { Portal } from 'react-native-paper'

import AddWebApp from './components/common/view/AddWebApp'
import Blurred from './components/common/view/Blurred'
import InternetConnection from './components/common/connectionDialog/internetConnection'

import About from './components/about/AboutState'
import BackupWallet from './components/backupWallet/BackupWalletState'
import ExportWallet from './components/backupWallet/ExportWalletData'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/appSwitch/AppSwitch'
import Splash from './components/splash/Splash'

import createApp from './lib/utils/createAppContainer'
import { navigationConfig } from './components/appNavigation/navigationConfig'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'

import { isInstalledApp } from './lib/utils/platform'
import { FVContextProvider } from './lib/contexts/fvContext'

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

const RouterWrapper = createApp(AppNavigator)

const Router = () => {
  // clear the active dialog state when the route is changing to prevent infinite blurred background
  // for example: when pressing browser history back button while feed card is opened - the route will be changed, but dialogData is still inside undux store
  const navigationStateHandler = useNavigationStateHandler()

  return (
    <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={true}>
      <FVContextProvider>
        {!isInstalledApp && <AddWebApp />}
        <Portal.Host>
          <Blurred whenDialog>
            <RouterWrapper onNavigationStateChange={navigationStateHandler} />
          </Blurred>
        </Portal.Host>
      </FVContextProvider>
    </InternetConnection>
  )
}
export default Router
