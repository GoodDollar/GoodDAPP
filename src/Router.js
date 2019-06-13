import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import { navigationConfig } from './components/appNavigation/navigationConfig'
import BackupWallet from './components/backupWallet/BackupWalletState'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/appSwitch/AppSwitch'
import GDStore from './lib/undux/GDStore'

// const Signup = props => suspenseWithIndicator(import('./components/signup/SignupState'), props)
// const Auth = props => suspenseWithIndicator(import('./components/auth/Auth'), props)
const Router = ({ isLoggedIn }) => {
  const AppNavigator = createNavigator(
    AppSwitch,
    SwitchRouter(
      {
        BackupWallet,
        AppNavigation
      },
      {
        initialRouteName: 'AppNavigation'
      },
      navigationConfig
    ),
    navigationConfig
  )

  let WebRouter
  if (Platform.OS === 'web') {
    WebRouter = createBrowserApp(AppNavigator)
  }
  return (
    <GDStore.Container>
      <WebRouter />
    </GDStore.Container>
  )
}
export default Router
