// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage } from 'react-native'
import { SceneView } from '@react-navigation/core'
import some from 'lodash/some'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import SimpleStore from '../../lib/undux/SimpleStore'
import GDStore from '../../lib/undux/GDStore'
import { updateAll as updateWalletStatus } from '../../lib/undux/utils/account'

import { checkAuthStatus as getLoginState } from '../../lib/login/checkAuthStatus'
import type { Store } from 'undux'

type LoadingProps = {
  navigation: any,
  descriptors: any
}

const log = logger.child({ from: 'AppSwitch' })

/**
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
const AppSwitch = (props: LoadingProps) => {
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()

  /*
  Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getParams = async () => {
    const { router, state } = props.navigation
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
  /*
  If a user has a saved destination path from before logging in or from inside-app (receipt view?)
  He won't be redirect in checkAuthStatus since it only happens on didmount and won't happen after
  use completes signup and becomes loggedin
*/
  const navigateToUrlAction = async () => {
    log.info('didUpdate')
    const destinationPath = await AsyncStorage.getItem('destinationPath')
    //once user logs in we can redirect him to saved destinationpath
    if (destinationPath) {
      const destDetails = JSON.parse(destinationPath)
      await AsyncStorage.removeItem('destinationPath')
      log.debug('destinationPath found:', destDetails)
      return props.navigation.navigate(destDetails)
    }
  }
  /**
   * Check's users' current auth status
   * @returns {Promise<void>}
   */
  const initialize = async () => {
    //after dynamic routes update, if user arrived here, then he is already loggedin
    //initialize the citizen status and wallet status
    const { credsOrError, isLoggedInCitizen, isLoggedIn } = await Promise.all([
      getLoginState(),
      updateWalletStatus()
    ]).then(([authResult, _]) => authResult)
    gdstore.set('isLoggedIn')(isLoggedIn)
    gdstore.set('isLoggedInCitizen')(isLoggedInCitizen)
    let destDetails = await getParams()
    if (isLoggedIn) {
      let topWalletRes = isLoggedInCitizen ? API.verifyTopWallet() : Promise.resolve()
      if (destDetails) {
        props.navigation.navigate(destDetails)
        return AsyncStorage.removeItem('destinationPath')
      } else props.navigation.navigate('AppNavigation')
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
            props.navigation.navigate(destDetails)
            return
          }
          log.debug('destinationPath saving details')
          //for non loggedin users, store non email validation params to the destinationPath for later
          //to be used once signed in
          const destinationPath = JSON.stringify(destDetails)
          AsyncStorage.setItem('destinationPath', destinationPath)
        }
        props.navigation.navigate('Auth')
      } else {
        // TODO: handle other statuses (4xx, 5xx), consider exponential backoff
        log.error('Failed to sign in', credsOrError)
        props.navigation.navigate('Auth')
      }
    }
  }

  const init = async () => {
    store.set('loadingIndicator')({ loading: true })
    await initialize()
    store.set('loadingIndicator')({ loading: false })
  }
  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    navigateToUrlAction()
  })

  const { descriptors, navigation } = props
  const activeKey = navigation.state.routes[navigation.state.index].key
  const descriptor = descriptors[activeKey]
  return (
    <React.Fragment>
      <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
    </React.Fragment>
  )
}

export default AppSwitch
