// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage } from 'react-native'
import { SceneView } from '@react-navigation/core'
import { DESTINATION_PATH } from '../../lib/constants/localStorage'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { updateAll as updateWalletStatus } from '../../lib/undux/utils/account'
import { checkAuthStatus as getLoginState } from '../../lib/login/checkAuthStatus'
import userStorage from '../../lib/gundb/UserStorage'
import Splash from '../splash/Splash'

type LoadingProps = {
  navigation: any,
  descriptors: any,
}

const log = logger.child({ from: 'AppSwitch' })

/**
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
const AppSwitch = (props: LoadingProps) => {
  const gdstore = GDStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const { router, state } = props.navigation
  const [ready, setReady] = useState(false)
  const [walletIsConnect, setWalletIsConnect] = useState(true)

  const setConnectEvents = () => {
    goodWallet.ready.then(() =>
      goodWallet.wallet.currentProvider
        .on('connect', () => {
          log.debug('web3 connect')
          setWalletIsConnect(true)
        })
        .on('close', () => {
          log.debug('web3 close')

          setWalletIsConnect(false)
        })
        .on('error', () => {
          log.debug('web3 error')

          setWalletIsConnect(false)
        })
    )
  }

  /*
  Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getParams = async () => {
    // const navInfo = router.getPathAndParamsForState(state)
    const destinationPath = await AsyncStorage.getItem(DESTINATION_PATH).then(JSON.parse)
    AsyncStorage.removeItem(DESTINATION_PATH)

    if (destinationPath) {
      const app = router.getActionForPathAndParams(destinationPath.path) || {}
      log.debug('destinationPath getParams', { destinationPath, router, state, app })

      //get nested routes
      const destRoute = actions => (actions && actions.action ? destRoute(actions.action) : actions)
      const destData = destRoute(app)
      destData.params = { ...destData.params, ...destinationPath.params }
      return destData
    }
    return undefined
  }

  /*
  If a user has a saved destination path from before logging in or from inside-app (receipt view?)
  He won't be redirected in checkAuthStatus since it is called on didmount effect and won't happen after
  user completes signup and becomes loggedin which just updates this component
*/
  const navigateToUrlAction = async () => {
    log.info('didUpdate')
    let destDetails = await getParams()

    //once user logs in we can redirect him to saved destinationpath
    if (destDetails) {
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
    const { isLoggedInCitizen, isLoggedIn } = await Promise.all([getLoginState(), updateWalletStatus(gdstore)]).then(
      ([authResult, _]) => authResult
    )
    log.debug({ isLoggedIn, isLoggedInCitizen })
    gdstore.set('isLoggedIn')(isLoggedIn)
    gdstore.set('isLoggedInCitizen')(isLoggedInCitizen)
    isLoggedInCitizen ? API.verifyTopWallet() : Promise.resolve()
    await userStorage.startSystemFeed()

    // if (isLoggedIn) {
    //   if (destDetails) {
    //     props.navigation.navigate(destDetails)
    //     return AsyncStorage.removeItem(DESTINATION_PATH)
    //   } else props.navigation.navigate('AppNavigation')
    // } else {
    //   const { jwt } = credsOrError
    //   if (jwt) {
    //     log.debug('New account, not verified, or did not finish signup', jwt)
    //     //for new accounts check if link is email validation if so
    //     //redirect to continue signup flow
    //     if (destDetails) {
    //       log.debug('destinationPath details found', destDetails)
    //       if (destDetails.params.validation) {
    //         log.debug('destinationPath redirecting to email validation')
    //         props.navigation.navigate(destDetails)
    //         return
    //       }
    //       log.debug('destinationPath saving details')
    //       //for non loggedin users, store non email validation params to the destinationPath for later
    //       //to be used once signed in
    //       const destinationPath = JSON.stringify(destDetails)
    //       AsyncStorage.setItem(DESTINATION_PATH, destinationPath)
    //     }
    //     props.navigation.navigate('Auth')
    //   } else {
    //     // TODO: handle other statuses (4xx, 5xx), consider exponential backoff
    //     log.error('Failed to sign in', credsOrError)
    //     props.navigation.navigate('Auth')
    //   }
    // }
  }

  const init = async () => {
    log.debug('initializing')

    try {
      await initialize()
      setReady(true)
    } catch (e) {
      showErrorDialog('Wallet could not be loaded. Please try again later.')
    }
  }
  useEffect(() => {
    init()
    navigateToUrlAction()
    setConnectEvents()
  }, [])

  // useEffect(() => {

  // })
  const { descriptors, navigation } = props
  const activeKey = navigation.state.routes[navigation.state.index].key
  const descriptor = descriptors[activeKey]
  const display =
    ready && walletIsConnect ? (
      <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
    ) : (
      <Splash />
    )
  return <React.Fragment>{display}</React.Fragment>
}

export default AppSwitch
