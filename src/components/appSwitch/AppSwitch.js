// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { SceneView } from '@react-navigation/core'
import { debounce, isEmpty } from 'lodash'
import moment from 'moment'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { DESTINATION_PATH, GD_USER_MASTERSEED } from '../../lib/constants/localStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../lib/constants/login'

import logger from '../../lib/logger/pino-logger'
import { getErrorMessage } from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { updateAll as updateWalletStatus } from '../../lib/undux/utils/account'
import { checkAuthStatus as getLoginState } from '../../lib/login/checkAuthStatus'
import userStorage from '../../lib/gundb/UserStorage'
import runUpdates from '../../lib/updates'
import useAppState from '../../lib/hooks/useAppState'
import { identifyWith } from '../../lib/analytics/analytics'
import Splash from '../splash/Splash'
import config from '../../config/config'
import { delay } from '../../lib/utils/async'
import SimpleStore from '../../lib/undux/SimpleStore'
import DeepLinking from '../../lib/utils/deepLinking'
import { isMobileNative } from '../../lib/utils/platform'
import { useInviteCode } from '../invite/useInvites'
import restart from '../../lib/utils/restart'

type LoadingProps = {
  navigation: any,
  descriptors: any,
}

const log = logger.child({ from: 'AppSwitch' })

const GAS_CHECK_DEBOUNCE_TIME = 1000
const showOutOfGasError = debounce(
  async props => {
    const gasResult = await goodWallet.verifyHasGas().catch(e => {
      const message = getErrorMessage(e)
      const exception = new Error(message)

      log.error('verifyTopWallet failed', message, exception)
    })
    log.debug('outofgaserror:', { gasResult })

    if (gasResult.ok === false && gasResult.error !== false) {
      props.navigation.navigate('OutOfGasError')
    }
  },
  GAS_CHECK_DEBOUNCE_TIME,
  {
    leading: true,
  },
)

const syncTXFromBlockchain = async () => {
  const lastUpdateDate = userStorage.userProperties.get('lastTxSyncDate') || 0
  const now = moment()

  if (moment(lastUpdateDate).isSame(now, 'day') === false) {
    try {
      const joinedAtBlockNumber = userStorage.userProperties.get('joinedAtBlock')
      await goodWallet.syncTxWithBlockchain(joinedAtBlockNumber)
      await userStorage.userProperties.set('lastTxSyncDate', now.valueOf())
    } catch (e) {
      log.error('syncTXFromBlockchain failed', e.message, e)
    }
  }
}

let unsuccessfulLaunchAttempts = 0

/**
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
const AppSwitch = (props: LoadingProps) => {
  const gdstore = GDStore.useStore()
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const { router, state } = props.navigation
  useInviteCode()
  const [ready, setReady] = useState(false)
  const { appState } = useAppState()

  const recheck = useCallback(() => {
    if (ready && gdstore) {
      showOutOfGasError(props)
    }
  }, [gdstore, ready])

  const backgroundUpdates = useCallback(() => {
    if (ready) {
      syncTXFromBlockchain()
    }
  }, [ready])

  useAppState({ onForeground: recheck, onBackground: backgroundUpdates })

  /*
  Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getRoute = (destinationPath = {}) => {
    let { path, params } = destinationPath
    if (path || params) {
      path = path || 'AppNavigation/Dashboard/Home'
      const app = router.getActionForPathAndParams(path) || {}
      log.debug('destinationPath getRoute', { path, params, router, state, app })

      //get nested routes
      const destRoute = actions => (actions && actions.action ? destRoute(actions.action) : actions)
      const destData = destRoute(app)
      destData.params = { ...destData.params, ...params }
      return destData
    }

    return undefined
  }

  /*
  If a user has a saved destination path from before logging in or from inside-app (receipt view?)
  He won't be redirected in checkAuthStatus since it is called on didmount effect and won't happen after
  user completes signup and becomes loggedin which just updates this component
*/
  const navigateToUrlAction = async (destinationPath: { path: string, params: {} }) => {
    destinationPath = destinationPath || (await AsyncStorage.getItem(DESTINATION_PATH))
    AsyncStorage.removeItem(DESTINATION_PATH)

    log.debug('navigateToUrlAction:', { destinationPath })

    //if no special destinationPath check if we have incoming params from web url, such as payment link/request
    //when path is empty
    if (!isMobileNative && !destinationPath) {
      const { params, pathname } = DeepLinking.params
      log.debug('navigateToUrlAction destinationPath empty getting web params from url', { params })
      if (pathname.length <= 1 && isEmpty(params) === false) {
        //this makes sure query params are passed as part of navigation
        destinationPath = { params }
      }
    }

    let destDetails = destinationPath && getRoute(destinationPath)

    //once user logs in we can redirect him to saved destinationPath
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
    AsyncStorage.setItem('GD_version', 'phase' + config.phase)

    const regMethod = (await AsyncStorage.getItem(GD_USER_MASTERSEED).then(_ => !!_))
      ? REGISTRATION_METHOD_TORUS
      : REGISTRATION_METHOD_SELF_CUSTODY
    store.set('regMethod')(regMethod)

    const email = await userStorage.getProfileFieldValue('email')
    identifyWith(email, undefined)
  }

  const init = async () => {
    log.debug('initializing')

    try {
      //after dynamic routes update, if user arrived here, then he is already loggedin
      //initialize the citizen status and wallet status
      //create jwt token and initialize the API service
      const [{ isLoggedInCitizen, isLoggedIn }] = await Promise.all([getLoginState(), updateWalletStatus(gdstore)])
      log.debug('initialize ready', { isLoggedIn, isLoggedInCitizen })
      const initReg = userStorage.initRegistered()
      gdstore.set('isLoggedIn')(isLoggedIn)
      gdstore.set('isLoggedInCitizen')(isLoggedInCitizen)

      //identify user asap for analytics
      const identifier = goodWallet.getAccountForType('login')
      identifyWith(undefined, identifier)

      initialize()
      runUpdates()
      showOutOfGasError(props)
      await initReg
      setReady(true)
    } catch (e) {
      const dialogShown = unsuccessfulLaunchAttempts > 3

      unsuccessfulLaunchAttempts += 1

      if (dialogShown) {
        //TODO: FIX window.location for RN
        log.error('failed initializing app', e.message, e, { dialogShown })
        showErrorDialog('Wallet could not be loaded. Please refresh.', '', { onDismiss: () => restart('/') })
      } else {
        await delay(1500)
        init()
      }
    }
  }

  const deepLinkingNavigation = data => {
    log.debug('deepLinkingNavigation: got url', { data })
    navigateToUrlAction({ path: data.pathname, params: data.queryParams })
  }

  useEffect(() => {
    init()
    navigateToUrlAction()
  }, [])

  useEffect(() => {
    if (!isMobileNative || !appState === 'active') {
      return
    }

    DeepLinking.subscribe(deepLinkingNavigation)
    return () => DeepLinking.unsubscribe()
  }, [appState])

  const { descriptors, navigation } = props
  const activeKey = navigation.state.routes[navigation.state.index].key
  const descriptor = descriptors[activeKey]
  const display = ready ? (
    <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
  ) : (
    <Splash animation={false} />
  )
  return <React.Fragment>{display}</React.Fragment>
}

export default AppSwitch
