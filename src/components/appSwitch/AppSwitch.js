// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { SceneView } from '@react-navigation/core'
import { debounce, isEmpty } from 'lodash'
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
import userStorage from '../../lib/userStorage/UserStorage'
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

let unsuccessfulLaunchAttempts = 0

/**
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
const AppSwitch = (props: LoadingProps) => {
  const { router, state } = props.navigation
  const gdstore = GDStore.useStore()
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const [ready, setReady] = useState(false)

  /*
  Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getRoute = (destinationPath = {}) => {
    let { path, params } = destinationPath

    if (path || params) {
      path = path || 'AppNavigation/Dashboard/Home'

      if (params && (params.paymentCode || params.code)) {
        path = 'AppNavigation/Dashboard/HandlePaymentLink'
      }

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
      const { params, pathname } = DeepLinking

      log.debug('navigateToUrlAction destinationPath empty getting web params from url', { params })

      if (pathname && pathname.length < 2 && !isEmpty(params)) {
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
      updateWalletStatus(gdstore)
      const { isLoggedInCitizen, isLoggedIn } = await getLoginState()
      log.debug('initialize ready', { isLoggedIn, isLoggedInCitizen })
      const initReg = userStorage.initRegistered()
      gdstore.set('isLoggedIn')(isLoggedIn)
      gdstore.set('isLoggedInCitizen')(isLoggedInCitizen)

      //identify user asap for analytics

      const identifier = goodWallet.getAccountForType('login')
      identifyWith(undefined, identifier)
      showOutOfGasError(props)
      await initReg
      initialize()
      runUpdates() //this needs to wait after initreg where we initialize the database

      setReady(true)
    } catch (e) {
      const dialogShown = unsuccessfulLaunchAttempts > 3

      unsuccessfulLaunchAttempts += 1

      if (dialogShown) {
        //if error in realmdb logout the user, he needs to signin/signup again
        log.error('failed initializing app', e.message, e, { dialogShown })
        if (e.message.includes('realmdb')) {
          await AsyncStorage.clear()
          return showErrorDialog(
            'We are sorry, but due to database upgrade, you need to perform the Signup process again. Make sure to use the same account you previously signed in with.',
            '',
            { onDismiss: () => restart('/') },
          )
        }
        showErrorDialog('Wallet could not be loaded. Please refresh.', '', { onDismiss: () => restart('/') })
      } else {
        await delay(1500)
        init()
      }
    }
  }

  const deepLinkingRef = useRef(null)
  const navigateToUrlRef = useRef(navigateToUrlAction)

  const recheck = useCallback(() => {
    const { current: data } = deepLinkingRef

    if (data) {
      log.debug('deepLinkingNavigation: got url', { data })

      navigateToUrlRef.current({ path: data.path, params: data.queryParams })
      deepLinkingRef.current = null
    }

    if (ready && gdstore) {
      // TODO: do not call private methods, create single method sync()
      // in user storage class designed to be called from outside
      userStorage.database._syncFromRemote()
      userStorage.userProperties._syncFromRemote()
      showOutOfGasError(props)
    }
  }, [gdstore, ready])

  const backgroundUpdates = useCallback(() => {}, [ready])

  useInviteCode()

  useEffect(() => void (navigateToUrlRef.current = navigateToUrlAction), [navigateToUrlAction])

  useAppState({ onForeground: recheck, onBackground: backgroundUpdates })

  useEffect(() => {
    init()
    navigateToUrlRef.current()

    if (!isMobileNative) {
      return
    }

    DeepLinking.subscribe(data => {
      if (AppState.currentState === 'active') {
        log.debug('deepLinkingNavigation: got url', { data })
        navigateToUrlRef.current({ path: data.path, params: data.queryParams })
        return
      }

      deepLinkingRef.current = data
    })

    return () => DeepLinking.unsubscribe()
  }, [])

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
