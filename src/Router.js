// @flow
import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { Portal } from 'react-native-paper'

import AddWebApp from './components/common/view/AddWebApp'
import Blurred from './components/common/view/Blurred'

import About from './components/about/AboutState'
import BackupWallet from './components/backupWallet/BackupWalletState'
import ExportWallet from './components/backupWallet/ExportWalletData'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/appSwitch/AppSwitch'

import createApp from './lib/utils/createAppContainer'
import { navigationConfig } from './components/appNavigation/navigationConfig'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'

import { isInstalledApp } from './lib/utils/platform'
import { VerificationContextProvider } from './components/faceVerification/context/VerificationContext'

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
    <React.Fragment>
      {!isInstalledApp && <AddWebApp />}
      <Portal.Host>
        <Blurred whenDialog>
          <VerificationContextProvider>
            <RouterWrapper onNavigationStateChange={navigationStateHandler} />
          </VerificationContextProvider>
        </Blurred>
      </Portal.Host>
    </React.Fragment>
  )
}
export default Router
