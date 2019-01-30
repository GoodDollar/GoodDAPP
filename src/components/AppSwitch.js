// @flow
import React from 'react'
import { SceneView } from '@react-navigation/core'
import goodWalletLogin from '../lib/login/GoodWalletLogin'

type LoadingProps = {
  navigation: any,
  descriptors: any
}

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
    await global.wallet.ready

    // when wallet is ready perform login to server (sign message with wallet and send to server)
    const credsOrError: any = await goodWalletLogin.auth()
    const isLoggedIn = credsOrError.jwt !== undefined

    if (isLoggedIn) {
      this.props.navigation.navigate('AppNavigation')
    } else {
      const { response } = credsOrError

      if (response && response.status === 400) {
        this.props.navigation.navigate('Auth')
      } else {
        // TODO: handle other statuses (4xx, 5xx), consider exponential backoff
        console.error('Failed to sign in', response)
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

export default AppSwitch
