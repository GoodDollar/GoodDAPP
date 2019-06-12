import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import { navigationConfig } from './components/appNavigation/navigationConfig'
import Auth from './components/auth/Auth'
import Signup from './components/signup/SignupState'
import SignIn from './components/signin/SignInState'
import BackupWallet from './components/backupWallet/BackupWalletState'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/appSwitch/AppSwitch'
import Splash from './components/splash/Splash'
import GDStore from './lib/undux/GDStore'

// const Signup = props => suspenseWithIndicator(import('./components/signup/SignupState'), props)
// const Auth = props => suspenseWithIndicator(import('./components/auth/Auth'), props)
const Router = ({ isLoggedIn }) => {
  const AppNavigator = createNavigator(
    AppSwitch,
    SwitchRouter(
      {
        Auth,
        Signup,
        SignIn,
        BackupWallet,
        AppNavigation
      },
      {
        initialRouteName: isLoggedIn ? 'AppNavigation' : 'Auth'
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
      <WebRouter isLoggedIn />
    </GDStore.Container>
  )
}
export default Router
