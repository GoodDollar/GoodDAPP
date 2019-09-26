import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import { Portal } from 'react-native-paper'
import { navigationConfig } from './components/appNavigation/navigationConfig'
import About from './components/about/AboutState'
import BackupWallet from './components/backupWallet/BackupWalletState'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/appSwitch/AppSwitch'
import GDStore from './lib/undux/GDStore'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'

const AppNavigator = createNavigator(
  AppSwitch,
  SwitchRouter(
    {
      About,
      BackupWallet,
      AppNavigation,
    },
    {
      initialRouteName: 'AppNavigation',
    },
    navigationConfig
  ),
  navigationConfig
)
let WebRouter
if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(AppNavigator)
}
const Router = () => {
  return (
    <GDStore.Container>
      <SimpleStoreDialog />
      <Portal.Host>
        <WebRouter />
      </Portal.Host>
    </GDStore.Container>
  )
}
export default Router
