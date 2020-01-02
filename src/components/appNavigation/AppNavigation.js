// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import React, { useEffect } from 'react'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'

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
  // const store = SimpleStore.useStore()
  // const gdstore = GDStore.useStore()
  // const account = gdstore.get('account')
  // let ready = account.ready
  // useEffect(() => {
  //   if (account.ready === false) {
  //     store.set('loadingIndicator')({ loading: true })
  //   } else {
  //     store.set('loadingIndicator')({ loading: false })
  //   }
  // }, [ready])

  // `account.ready` will be set to `true` after retrieving the required user information in `updateAll`,
  // if not ready will display the app loading indicator
  return <AppNavigator navigation={navigation} screenProps={{ routes }} />
}

// const appNavigation = GDStore.withStore(AppNavigation)
AppNavigation.router = AppNavigator.router
AppNavigation.navigationOptions = navigationOptions

export default AppNavigation
