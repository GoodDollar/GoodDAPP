// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import React from 'react'
import type { Store } from 'undux'

// TODO: Should we do this diferently?
import buySellIcon from '../../assets/buySellIcon.png'
import donateIcon from '../../assets/donateIcon.png'
import homeIcon from '../../assets/homeIcon.png'
import rewardsIcon from '../../assets/rewardsIcon.png'

import GDStore from '../../lib/undux/GDStore'
import Dashboard from '../dashboard/Dashboard'
import Splash from '../splash/Splash'
import BuySell from './BuySell'
import Donate from './Donate'
import Rewards from './Rewards'
import Profile from '../profile/Profile'

import { checkAuthStatus } from '../../lib/login/checkAuthStatus'

type AppNavigationProps = {
  navigation: any,
  store: Store
}

type AppNavigationState = {
  ready: boolean
}

const routes = {
  Rewards: {
    screen: Rewards,
    icon: rewardsIcon
  },
  BuySell: {
    screen: BuySell,
    icon: buySellIcon
  },
  Dashboard: {
    screen: Dashboard,
    icon: homeIcon
  },
  Donate: {
    screen: Donate,
    icon: donateIcon
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
  // checkAuthStatus() {
  //   if (this.props.store.get('isLoggedInCitizen')) return

  //   // if not isLoggedInCitizen yet we should check status
  //   return checkAuthStatus(this.props.store)
  // }

  // async componentDidMount() {
  //   await this.checkAuthStatus()
  // }

  // async componentDidUpdate() {
  //   await this.checkAuthStatus()
  // }

  render() {
    const account = this.props.store.get('account')
    // `account.ready` will be set to `true` after retrieving the required user information in `updateAll`,
    // if not ready will display a blank screen (`null`)
    return account.ready ? <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} /> : null
  }
}

const appNavigation = GDStore.withStore(AppNavigation)
appNavigation.router = AppNavigator.router

export default appNavigation
