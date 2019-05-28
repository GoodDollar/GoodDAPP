// @flow
import React from 'react'
import { AsyncStorage } from 'react-native'
import { SceneView } from '@react-navigation/core'
import some from 'lodash/some'
import { Helmet } from 'react-helmet'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import GDStore from '../../lib/undux/GDStore'
import { checkAuthStatus } from '../../lib/login/checkAuthStatus'
import type { Store } from 'undux'
import { CustomDialog } from '../common'
import LoadingIndicator from '../common/LoadingIndicator'

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
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
class AppSwitch extends React.Component<LoadingProps, {}> {
  /**
   * Triggers the required actions before navigating to any app's page
   * @param {LoadingProps} props
   */
  constructor(props: LoadingProps) {
    super(props)
    this.ready = false
    this.checkAuthStatus().then(r => {
      this.ready = true
      this.forceUpdate()
    })
  }

  getParams = async () => {
    const { router, state } = this.props.navigation
    const navInfo = router.getPathAndParamsForState(state)
    const destinationPath = await AsyncStorage.getItem('destinationPath')
    log.debug('getParams', { destinationPath, navInfo, router, state })
    if (Object.keys(navInfo.params).length && !destinationPath) {
      const app = router.getActionForPathAndParams(navInfo.path)
      const destRoute = actions => (some(actions, 'action') ? destRoute(actions.action) : actions.action)
      const destData = { ...destRoute(app), params: navInfo.params }
      return destData
    } else if (destinationPath) return JSON.parse(destinationPath)
    return undefined
  }
  //TODO: add shouldComponentUpdate to rerender only on route change/dialog?
  async componentDidUpdate() {
    log.info('didUpdate')
    const destinationPath = await AsyncStorage.getItem('destinationPath')
    //once user logs in we can redirect him to saved destinationpath
    if (destinationPath && this.props.store.get('isLoggedIn')) {
      const destDetails = JSON.parse(destinationPath)
      await AsyncStorage.removeItem('destinationPath')
      log.debug('destinationPath found:', destDetails)
      return this.props.navigation.navigate(destDetails)
    }
  }
  /**
   * Check's users' current auth status
   * @returns {Promise<void>}
   */
  checkAuthStatus = async () => {
    const { credsOrError, isLoggedInCitizen, isLoggedIn } = await Promise.all([
      checkAuthStatus(this.props.store),
      delay(TIMEOUT)
    ]).then(([authResult]) => authResult)
    let destDetails = await this.getParams()
    if (isLoggedIn) {
      let topWalletRes = isLoggedInCitizen ? API.verifyTopWallet() : Promise.resolve()
      if (destDetails) {
        this.props.navigation.navigate(destDetails)
        return AsyncStorage.removeItem('destinationPath')
      } else this.props.navigation.navigate('AppNavigation')
    } else {
      const { jwt } = credsOrError
      if (jwt) {
        log.debug('New account, not verified, or did not finish signup', jwt)
        //for new accounts check if link is email validation if so
        //redirect to continue signup flow
        if (destDetails) {
          log.debug('destinationPath details found', destDetails)
          if (destDetails.params.validation) {
            log.debug('destinationPath redirecting to email validation')
            this.props.navigation.navigate(destDetails)
            return
          }
          log.debug('destinationPath saving details')
          //for non loggedin users, store non email validation params to the destinationPath for later
          //to be used once signed in
          const destinationPath = JSON.stringify(destDetails)
          AsyncStorage.setItem('destinationPath', destinationPath)
        }
        this.props.navigation.navigate('Auth')
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
        {/* <Helmet>
          <title>GoodDollar | UBI</title>
        </Helmet> */}

        <CustomDialog
          {...dialogData}
          onDismiss={(...args) => {
            const currentDialogData = { ...dialogData }
            store.set('currentScreen')({ dialogData: { visible: false } })
            currentDialogData.onDismiss && currentDialogData.onDismiss(currentDialogData)
          }}
        />
        <LoadingIndicator force={!this.ready} />
        <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
      </React.Fragment>
    )
  }
}

export default GDStore.withStore(AppSwitch)
