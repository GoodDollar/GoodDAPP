// @flow
import React from 'react'
import { SceneView } from '@react-navigation/core'
import some from 'lodash/some'
import logger from '../lib/logger/pino-logger'
import API from '../lib/API/api'
import GDStore from '../lib/undux/GDStore'
import { checkAuthStatus } from '../lib/login/checkAuthStatus'
import type { Store } from 'undux'
import { CustomDialog } from '../components/common'
import LoadingIndicator from './common/LoadingIndicator'
import { Helmet } from 'react-helmet'

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

  getParams = () => {
    const { router, state } = this.props.navigation
    const navInfo = router.getPathAndParamsForState(state)

    if (Object.keys(navInfo.params).length && this.props.store.get('destinationPath') === '') {
      const app = router.getActionForPathAndParams(navInfo.path)
      const destRoute = actions => (some(actions, 'action') ? destRoute(actions.action) : actions.action)
      const destinationPath = JSON.stringify({ ...destRoute(app), params: navInfo.params })
      this.props.store.set('destinationPath')(destinationPath)
    }
  }

  /**
   * Check's users' current auth status
   * @returns {Promise<void>}
   */
  checkAuthStatus = async () => {
    const { credsOrError } = await Promise.all([checkAuthStatus(this.props.store), delay(TIMEOUT)]).then(
      ([authResult]) => authResult
    )
    // debugger
    if (this.props.store.get('isLoggedInCitizen')) {
      let topWalletRes = API.verifyTopWallet()

      this.props.navigation.navigate('AppNavigation')
    } else {
      const { jwt } = credsOrError
      this.getParams()

      if (jwt) {
        log.debug('New account, not verified, or did not finish signup', jwt)

        if (this.props.store.get('destinationPath') !== '') {
          this.props.navigation.navigate(JSON.parse(this.props.store.get('destinationPath')))
          this.props.store.set('destinationPath')('')
        } else {
          this.props.navigation.navigate('Auth')
        }
      } else {
        // TODO: handle other statuses (4xx, 5xx), consider exponential backoff
        log.error('Failed to sign in', credsOrError)
        this.props.navigation.navigate('Auth')
      }
    }
  }

  render() {
    const { descriptors, navigation, store } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    const { dialogData } = store.get('currentScreen')
    return (
      <React.Fragment>
        <Helmet>
          <title>Good Dollar</title>
        </Helmet>

        <CustomDialog
          {...dialogData}
          onDismiss={(...args) => {
            const currentDialogData = { ...dialogData }
            store.set('currentScreen')({ dialogData: { visible: false } })
            currentDialogData.onDismiss && currentDialogData.onDismiss(currentDialogData)
          }}
        />
        <LoadingIndicator />
        <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
      </React.Fragment>
    )
  }
}

export default GDStore.withStore(AppSwitch)
