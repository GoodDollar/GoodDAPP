// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import React from 'react'
import type { Store } from 'undux'
import { navigationOptions } from './navigationConfig'

// TODO: Should we do this diferently?
import homeIcon from '../../assets/homeIcon.png'

import GDStore from '../../lib/undux/GDStore'
import Dashboard from '../dashboard/Dashboard'
import Profile from '../profile/Profile'

type AppNavigationProps = {
  navigation: any,
  store: Store
}

type AppNavigationState = {
  ready: boolean
}

const routes = {
  Dashboard: {
    screen: Dashboard,
    icon: homeIcon,
    display: false
  },
  Profile: {
    screen: Profile,
    display: false
  }
}

const initialRouteName = 'Dashboard'
const AppNavigator = createSwitchNavigator(routes, { initialRouteName })

/**
 * Switch navigation between all screens on the tabs. Each of this screen should be a StackNavigation
 * Dashboard is the initial route
 */
class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
  render() {
    const account = this.props.store.get('account')
    // `account.ready` will be set to `true` after retrieving the required user information in `updateAll`,
    // if not ready will display a blank screen (`null`)
    return account.ready ? <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} /> : null
  }
}

const appNavigation = GDStore.withStore(AppNavigation)
appNavigation.router = AppNavigator.router
appNavigation.navigationOptions = navigationOptions

export default appNavigation
