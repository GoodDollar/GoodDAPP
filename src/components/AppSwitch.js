// @flow
import React from 'react'
import { SceneView } from '@react-navigation/core'
import goodWallet from '../lib/wallet/GoodWallet'
import goodWalletLogin from '../lib/login/GoodWalletLogin'
import logger from '../lib/logger/pino-logger'
import API from '../lib/API/api'
import GDStore from '../lib/undux/GDStore'
import type { Store } from 'undux'

type LoadingProps = {
  navigation: any,
  descriptors: any,
  store: Store
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
  /**
   * Triggers the required actions before navigating to any app's page
   * @param {LoadingProps} props
   */
  constructor(props: LoadingProps) {
    super(props)
    this.checkAuthStatus()
  }

  /**
   * Check's users' current auth status
   * @returns {Promise<void>}
   */
  checkAuthStatus = async () => {
    // when wallet is ready perform login to server (sign message with wallet and send to server)
    const [credsOrError, isCitizen]: any = await Promise.all([
      goodWalletLogin.auth(),
      goodWallet.isCitizen(),
      delay(TIMEOUT)
    ])
    let topWalletRes = API.verifyTopWallet()
    log.info('Top wallet result', topWalletRes)
    const isLoggedIn = credsOrError.jwt !== undefined
    this.props.store.set('isLoggedInCitizen')(isLoggedIn && isCitizen)
    if (this.props.store.get('isLoggedInCitizen')) {
      this.props.navigation.navigate('AppNavigation')
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
    const { descriptors, navigation } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    return <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
  }
}

export default GDStore.withStore(AppSwitch)
