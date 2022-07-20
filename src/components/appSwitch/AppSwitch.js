// @flow
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useDebouncedCallback } from 'use-debounce'
import { SceneView } from '@react-navigation/core'
import { isEmpty } from 'lodash'

import AsyncStorage from '../../lib/utils/asyncStorage'
import { DESTINATION_PATH } from '../../lib/constants/localStorage'

import logger from '../../lib/logger/js-logger'
import { useDialog } from '../../lib/dialog/useDialog'
import runUpdates from '../../lib/updates'
import useAppState from '../../lib/hooks/useAppState'
import usePropsRefs from '../../lib/hooks/usePropsRefs'
import { identifyWith } from '../../lib/analytics/analytics'
import Splash from '../splash/Splash'
import config from '../../config/config'
import DeepLinking from '../../lib/utils/deepLinking'
import { isMobileNative } from '../../lib/utils/platform'
import { restart } from '../../lib/utils/system'
import { GoodWalletContext, useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { getRouteName } from '../appNavigation/stackNavigation'

import { getRouteParams } from '../../lib/utils/navigation'
type LoadingProps = {
  navigation: any,
  descriptors: any,
}

const GAS_CHECK_DEBOUNCE_TIME = 1000
const log = logger.child({ from: 'AppSwitch' })

/**
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
const AppSwitch = (props: LoadingProps) => {
  const { descriptors, navigation } = props
  const { state } = navigation
  const [ready, setReady] = useState(false)
  const { showErrorDialog } = useDialog()
  const { initWalletAndStorage, isCitizen, login } = useContext(GoodWalletContext)
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const deepLinkingRef = useRef(null)
  const initializingRef = useRef(null)
  const { initializedRegistered } = userStorage || {}
  const [getNavigation, isRegistered] = usePropsRefs([navigation, initializedRegistered])

  const _showOutOfGasError = useCallback(async () => {
    const { state, navigate } = getNavigation()
    const { ok, error } = await goodWallet.verifyHasGas()
    const isOutOfGas = ok === false && error !== false
    const currentRoute = getRouteName(state)

    log.debug('outofgas check result:', { ok, error, currentRoute })

    if (!isOutOfGas || currentRoute === 'OutOfGasError') {
      return
    }

    navigate('OutOfGasError')
  }, [goodWallet, userStorage, getNavigation])

  const showOutOfGasError = useDebouncedCallback(_showOutOfGasError, GAS_CHECK_DEBOUNCE_TIME, { leading: true })

  /*
    Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getRoute = useCallback(
    (destinationPath = {}) => {
      let { path, params } = destinationPath
      const { paymentCode, code } = params || {}

      if (!path && !params) {
        return
      }

      if (paymentCode || code) {
        path = 'AppNavigation/Dashboard/HandlePaymentLink'
      } else if (!path) {
        path = 'AppNavigation/Dashboard/Home'
      }

      return getRouteParams(getNavigation(), path, params)
    },
    [getNavigation],
  )

  /*
    If a user has a saved destination path from before logging in or from inside-app (receipt view?)
    He won't be redirected in checkAuthStatus since it is called on didmount effect and won't happen after
    user completes signup and becomes loggedin which just updates this component
  */
  const navigateToUrlAction = useCallback(
    async (destinationPath: { path: string, params: {} }) => {
      const { navigate } = getNavigation()

      destinationPath = destinationPath || (await AsyncStorage.getItem(DESTINATION_PATH))
      AsyncStorage.removeItem(DESTINATION_PATH)

      log.debug('navigateToUrlAction:', { destinationPath })

      // if no special destinationPath check if we have incoming params from web url, such as payment link/request
      // when path is empty
      if (!isMobileNative && !destinationPath) {
        const { params, pathname } = DeepLinking

        log.debug('navigateToUrlAction destinationPath empty getting web params from url', { params })

        if (pathname && pathname.length < 2 && !isEmpty(params)) {
          //this makes sure query params are passed as part of navigation
          destinationPath = { params }
        }
      }

      let destDetails = destinationPath && getRoute(destinationPath)

      // once user logs in we can redirect him to saved destinationPath
      if (destDetails) {
        log.debug('destinationPath found:', destDetails)
        return navigate(destDetails)
      }
    },
    [getRoute, getNavigation],
  )

  const restartWithMessage = useCallback(
    async (message, withLogout = true) => {
      if (false !== withLogout) {
        await AsyncStorage.clear()
      }

      showErrorDialog(message, '', {
        onDismiss: () => restart('/'),
      })
    },
    [showErrorDialog],
  )

  const init = useCallback(
    async onRetry => {
      log.debug('initializing', { ready })

      try {
        // after dynamic routes update, if user arrived here, then he is already loggedin
        // initialize the citizen status and wallet status
        // create jwt token and initialize the API service
        log.debug('initialize ready', { isLoggedIn, isLoggedInCitizen })

        // identify user asap for analytics
        const identifier = goodWallet.getAccountForType('login')
        const email = userStorage.getProfileFieldValue('email') || null

        identifyWith(email, identifier)
        AsyncStorage.safeSet('GD_version', 'phase' + config.phase)

        // this needs to wait after initreg where we initialize the database
        runUpdates(goodWallet, userStorage, log)
        showOutOfGasError()

        log.debug('initialize done')
        setReady(true)
    } catch (e) {
      restartWithMessage('Wallet could not be loaded. Please refresh.', false)
    }
  }, [restartWithMessage, goodWallet, userStorage, showOutOfGasError, isCitizen])

  const openDeepLink = useCallback(
    data => {
      const { path, queryParams } = data || {}

      log.debug('deepLinkingNavigation: got url', { data })
      navigateToUrlAction({ path, params: queryParams })
    },
    [navigateToUrlAction],
  )

  const checkDeepLink = useCallback(() => {
    const { current: data } = deepLinkingRef

    if (!data) {
      return
    }

    openDeepLink(data)
    deepLinkingRef.current = null
  }, [openDeepLink])

  const recheck = useCallback(() => {
    checkDeepLink()

    if (ready && userStorage && goodWallet) {
      userStorage.sync()
      login() // this will refresh the jwt token if wasnt active for a long time
      showOutOfGasError()
    }
  }, [ready, login, goodWallet, userStorage, showOutOfGasError, checkDeepLink])

  const persist = useCallback(() => {
    if (initializedRegistered) {
      userStorage.userProperties.persist()
    }
  }, [userStorage, initializedRegistered])

  useAppState({ onForeground: recheck, onBackground: persist })

  useEffect(() => {
    // initialize with initRegistered = true only if user is loggedin correctly (ie jwt not expired)
    if (initializingRef.current) {
      return
    }

    const onInitializationFailed = e => {
      if ('UnsignedJWTError' === e.name) {
        return restartWithMessage(
          "You haven't used GoodDollar app on this device for a long time. " +
            'You need to sign in again. Make sure to use the same account you previously signed in with.',
        )
      }

      // if error in realmdb logout the user, he needs to signin/signup again
      log.error('failed initializing app', e.message, e)

      if (e.message.includes('realmdb')) {
        return restartWithMessage(
          'We are sorry, but due to database upgrade, you need to perform the Signup process again. ' +
            'Make sure to use the same account you previously signed in with.',
        )
      }

      restartWithMessage('Wallet could not be loaded. Please refresh.', false)
    }

    initializingRef.current = true
    initWalletAndStorage(undefined, 'SEED')
      .then(() => log.debug('storage and wallet ready'))
      .catch(onInitializationFailed)
      .finally(() => (initializingRef.current = false))
  }, [initWalletAndStorage, restartWithMessage])

  useEffect(() => {
    if (ready || !initializedRegistered) {
      return
    }

    initialize()
    navigateToUrlAction()
  }, [ready, initialize, initializedRegistered, navigateToUrlAction])

  useEffect(() => {
    if (isMobileNative && initializedRegistered) {
      // once app becomes init registered we nee to re check deep link ref
      // otherwise it will be processed after app went background then activates again
      checkDeepLink()
    }
  }, [initializedRegistered, checkDeepLink])

  useEffect(() => {
    if (!isMobileNative) {
      return
    }

    DeepLinking.subscribe(data => {
      if (isRegistered() && AppState.currentState === 'active') {
        openDeepLink(data)
        return
      }

      deepLinkingRef.current = data
    })

    return DeepLinking.unsubscribe
  }, [isRegistered, checkDeepLink, openDeepLink])

  const activeKey = state.routes[state.index].key
  const descriptor = descriptors[activeKey]

  const display = ready ? (
    <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
  ) : (
    <Splash animation={false} />
  )

  return <React.Fragment>{display}</React.Fragment>
}

export default AppSwitch
