// @flow
import React from 'react'
import { SceneView } from '@react-navigation/core'
import goodWallet from '../lib/wallet/GoodWallet'
import goodWalletLogin from '../lib/login/GoodWalletLogin'
import API from '../lib/API/api'

import logger from '../lib/logger/pino-logger'

type LoadingProps = {
  navigation: any,
  descriptors: any
}

const log = logger.child({ from: 'AppSwitch' })

function delay(t, v) {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
const TIMEOUT = 1000

/**
 * The main app route. Here we decide where to go depending on the user's credentials status
 */
class AppSwitch extends React.Component<LoadingProps, {}> {
  state = {
    activeKey: 'Splash'
  }
  /**
   * Triggers the required actions before navigating to any app's page
   * @param {LoadingProps} props
   */
  constructor(props: LoadingProps) {
    super(props)
    const { navigation } = this.props
    this.savedActiveKey = navigation.state.routes[navigation.state.index].key
  }
  componentWillMount() {
    this.checkAuthStatus()
  }

  /**
   * Check's users' current auth status
   * @returns {Promise<void>}
   */
  checkAuthStatus = async () => {
    await goodWallet.ready

    // when wallet is ready perform login to server (sign message with wallet and send to server)
    const [credsOrError, isCitizen]: any = await Promise.all([
      goodWalletLogin.auth(),
      goodWallet.isCitizen(),
      delay(TIMEOUT)
    ])
    const isLoggedIn = credsOrError.jwt !== undefined

    if (isLoggedIn && isCitizen) {
      log.info('to AppNavigation', this.savedActiveKey)
      // this.props.navigation.navigate('AppNavigation')
      // this.props.navigation.navigate(this.activeKey)
      this.setState({ activeKey: this.savedActiveKey })
    } else {
      const { jwt } = credsOrError

      if (jwt) {
        log.debug('New account, not verified, or did not finish signup', jwt)
        this.props.navigation.navigate('Auth')
      } else {
        // TODO: handle other statuses (4xx, 5xx), consider exponential backoff
        log.error('Failed to sign in', credsOrError)
        this.props.navigation.navigate('Auth')
      }
    }
  }

  render() {
    const { descriptors } = this.props
    const descriptor = descriptors[this.state.activeKey]
    return <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
  }
}

export default AppSwitch
