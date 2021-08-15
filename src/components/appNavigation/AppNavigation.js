// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import React from 'react'
import type { Store } from 'undux'

import Dashboard from '../dashboard/Dashboard'
import Profile from '../profile/Profile'
import { navigationOptions } from './navigationConfig'

/**
 * @type
 */
type AppNavigationProps = {
  navigation: any,
  store: Store,
}

const routes = {
  Dashboard: {
    screen: Dashboard,
    display: false,
  },
  Profile: {
    screen: Profile,
    display: false,
  },
}

const initialRouteName = 'Dashboard'
const AppNavigator = createSwitchNavigator(routes, { initialRouteName })

/**
 * Switch navigation between all screens on the tabs. Each of this screen should be a StackNavigation
 * Dashboard is the initial route
 * @param {AppNavigationProps} props
 */
const AppNavigation = ({ navigation }: AppNavigationProps) => {
  return <AppNavigator navigation={navigation} screenProps={{ routes }} />
}

// const appNavigation = GDStore.withStore(AppNavigation)
AppNavigation.router = AppNavigator.router
AppNavigation.navigationOptions = navigationOptions

export default AppNavigation
