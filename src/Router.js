// @flow
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
import { fireEventFromNavigation } from './lib/analytics/analytics'
import AddWebApp from './components/common/view/AddWebApp'
import { isInstalledApp } from './lib/utils/platform'
import { createAppContainer } from 'react-navigation'

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
const RouterWrapper = Platform.OS === 'web' ? createBrowserApp(AppNavigator) : createAppContainer(AppNavigator)

const onRouteChange = (prevNav, nav, route) => {
  fireEventFromNavigation(route)
}

const Router = () => {
  return (
    <GDStore.Container>
      {!isInstalledApp && <AddWebApp />}
      <Portal.Host>
        <RouterWrapper onNavigationStateChange={onRouteChange} />
      </Portal.Host>
    </GDStore.Container>
  )
}
export default Router
