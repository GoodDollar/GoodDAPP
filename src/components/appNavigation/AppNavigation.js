// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import React from 'react'
import type { Store } from 'undux'

// TODO: Should we do this diferently?
import buySellIcon from '../../assets/buySellIcon.png'
import donateIcon from '../../assets/donateIcon.png'
import homeIcon from '../../assets/homeIcon.png'
import rewardsIcon from '../../assets/rewardsIcon.png'

import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import goodWallet from '../../lib/wallet/GoodWallet'
import Dashboard from '../dashboard/Dashboard'
import Splash from '../splash/Splash'
import BuySell from './BuySell'
import Donate from './Donate'
import Rewards from './Rewards'

type AppNavigationProps = {
  navigation: any,
  store: Store
}

type AppNavigationState = {
  ready: boolean
}

const log = logger.child({ from: 'AppNavigation' })

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
  }
}

const initialRouteName = 'Dashboard'
const AppNavigator = createSwitchNavigator(routes, { initialRouteName })

/**
 * Switch navigation between all screens on the tabs. Each of this screen should be a StackNavigation
 * Dashboard is the initial route
 */
class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
  state = {
    ready: false
  }

  async componentDidMount(): Promise<void> {
    log.debug('mounting')
    await goodWallet.ready
    await this.updateValues()
    this.setAsReady()
    this.initTransferEvents()
    log.debug('done mounting')
  }

  setAsReady() {
    this.setState({ ready: true })
  }

  updateValues() {
    return Promise.all([this.updateBalance(), this.updateEntitlement()])
  }

  /**
   * Retrieves account's balance and sets its value to the state
   * @returns {Promise<void>}
   */
  async updateBalance(): Promise<void> {
    try {
      log.debug('updating balance')

      const { store } = this.props
      const account = store.get('account')
      const balance = await goodWallet.balanceOf()

      log.debug({ balance })

      account.balance = balance
      store.set('account')(account)
    } catch (error) {
      log.error('failed to gather balance value:', { error })
    }
  }

  /**
   * Retrieves account's entitlement and sets its value to the state
   * @returns {Promise<void>}
   */
  async updateEntitlement(): Promise<void> {
    try {
      log.debug('updating entitlement')

      const { store } = this.props
      const account = store.get('account')
      const entitlement = await goodWallet.checkEntitlement()

      log.debug({ entitlement })

      account.entitlement = entitlement
      store.set('account')(account)
    } catch (error) {
      log.error('failed to gather entitlement value:', { error })
    }
  }

  /**
   * Starts listening to Transfer events to (and from) the current account
   */
  initTransferEvents(): void {
    log.debug('checking events')

    goodWallet.balanceChanged(this.onBalanceChange)
  }

  /**
   * Callback to handle events emmited
   * @param error
   * @param event
   * @returns {Promise<void>}
   */
  onBalanceChange = async (error: {}, event: [any]) => {
    log.info('new Transfer event:', { error, event })

    if (!error) {
      await this.updateValues()
    }
  }

  render() {
    if (this.state.ready) {
      return <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
    }

    return <Splash />
  }
}

const appNavigation = GDStore.withStore(AppNavigation)
appNavigation.router = AppNavigator.router

export default appNavigation
