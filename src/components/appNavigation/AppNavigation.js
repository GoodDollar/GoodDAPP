// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import { Icon, normalize } from 'react-native-elements'
import React from 'react'
import type { Store } from 'undux'

// TODO: Should we do this diferently?
import buySellIcon from '../../assets/buySellIcon.png'
import donateIcon from '../../assets/donateIcon.png'
import homeIcon from '../../assets/homeIcon.png'
import rewardsIcon from '../../assets/rewardsIcon.png'
import burgerIcon from '../../assets/burgerIcon.png'

import GDStore from '../../lib/undux/GDStore'
import Dashboard from '../dashboard/Dashboard'
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
    icon: rewardsIcon,
    display: false
  },
  BuySell: {
    screen: BuySell,
    icon: buySellIcon,
    display: false
  },
  Dashboard: {
    screen: Dashboard,
    icon: homeIcon,
    display: false
  },
  Donate: {
    screen: Donate,
    icon: donateIcon,
    display: false
  },
  Profile: {
    screen: Profile,
    display: false
  },
  Sidemenu: {
    screen: Dashboard,
    icon: burgerIcon,
    displayText: false,
    iconStyle: {
      width: normalize(20),
      maxHeight: normalize(20),
      marginTop: normalize(20)
    },
    buttonStyle: {
      marginLeft: 'auto',
      marginRight: normalize(30)
    }
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

export default appNavigation
