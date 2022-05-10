// @flow
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useDebouncedCallback } from 'use-debounce'
import { SceneView } from '@react-navigation/core'
import { isEmpty, noop } from 'lodash'

import AsyncStorage from '../../lib/utils/asyncStorage'
import { DESTINATION_PATH } from '../../lib/constants/localStorage'

import logger from '../../lib/logger/js-logger'
import { getErrorMessage } from '../../lib/API/api'
import { useDialog } from '../../lib/dialog/useDialog'
import { useCheckAuthStatus } from '../../lib/login/checkAuthStatus'
import runUpdates from '../../lib/updates'
import useAppState from '../../lib/hooks/useAppState'
import { identifyWith } from '../../lib/analytics/analytics'
import Splash from '../splash/Splash'
import config from '../../config/config'
import { delay } from '../../lib/utils/async'
import DeepLinking from '../../lib/utils/deepLinking'
import { isMobileNative } from '../../lib/utils/platform'
import restart from '../../lib/utils/restart'
import { GoodWalletContext, useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'

import { getRouteParams } from '../../lib/utils/linking'

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
  const [ready, setReady] = useState(false)
  const { showErrorDialog } = useDialog()
  const { initWalletAndStorage } = useContext(GoodWalletContext)
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const unsuccessfulLaunchAttemptsRef = useRef(0)
  const deepLinkingRef = useRef(null)

  const {
    authStatus: [isLoggedInCitizen, isLoggedIn],
    refresh,
  } = useCheckAuthStatus()

  const _showOutOfGasError = useCallback(async () => {
    const gasResult = await goodWallet.verifyHasGas().catch(e => {
      const message = getErrorMessage(e)
      const exception = new Error(message)

      log.error('verifyTopWallet failed', message, exception)
    })

    log.debug('outofgas check result:', { gasResult })

    if (gasResult.ok === false && gasResult.error !== false) {
      navigation.navigate('OutOfGasError')
    }
  }, [navigation, goodWallet, userStorage])

  const showOutOfGasError = useDebouncedCallback(_showOutOfGasError, GAS_CHECK_DEBOUNCE_TIME, { leading: true })

  /*
    Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getRoute = useCallback(
    (destinationPath = {}) => {
      let { path, params } = destinationPath

      if (path || params) {
        path = path || 'AppNavigation/Dashboard/Home'

        if (params && (params.paymentCode || params.code)) {
          path = 'AppNavigation/Dashboard/HandlePaymentLink'
        }

        return getRouteParams(navigation, path, params)
      }

      return undefined
    },
    [navigation],
  )

  /*
    If a user has a saved destination path from before logging in or from inside-app (receipt view?)
    He won't be redirected in checkAuthStatus since it is called on didmount effect and won't happen after
    user completes signup and becomes loggedin which just updates this component
  */
  const navigateToUrlAction = useCallback(
    async (destinationPath: { path: string, params: {} }) => {
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
        return navigation.navigate(destDetails)
      }
    },
    [navigation, getRoute],
  )

  /**
   * Check's users' current auth status
   * @returns {Promise<void>}
   */
  const initialize = useCallback(async () => {
    AsyncStorage.setItem('GD_version', 'phase' + config.phase)

    const email = await userStorage.getProfileFieldValue('email')
    identifyWith(email, undefined)
  }, [userStorage])

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

  const init = useCallback(async () => {
    log.debug('initializing', { ready })

    try {
      // after dynamic routes update, if user arrived here, then he is already loggedin
      // initialize the citizen status and wallet status
      // create jwt token and initialize the API service
      log.debug('initialize ready', { isLoggedIn, isLoggedInCitizen })

      //identify user asap for analytics
      const identifier = goodWallet.getAccountForType('login')

      identifyWith(undefined, identifier)
      showOutOfGasError()

      initialize()
      runUpdates(goodWallet, userStorage) //this needs to wait after initreg where we initialize the database

      log.debug('initialize done')
      setReady(true)
    } catch (e) {
      if ('UnsignedJWTError' === e.name) {
        return restartWithMessage(
          "You haven't used GoodDollar app on this device for a long time. " +
            'You need to sign in again. Make sure to use the same account you previously signed in with.',
        )
      }

      const dialogShown = unsuccessfulLaunchAttemptsRef.current > 3

      unsuccessfulLaunchAttemptsRef.current += 1

      if (dialogShown) {
        // if error in realmdb logout the user, he needs to signin/signup again
        log.error('failed initializing app', e.message, e, { dialogShown })

        if (e.message.includes('realmdb')) {
          return restartWithMessage(
            'We are sorry, but due to database upgrade, you need to perform the Signup process again. ' +
              'Make sure to use the same account you previously signed in with.',
          )
        }

        restartWithMessage('Wallet could not be loaded. Please refresh.', false)
      } else {
        await delay(1500)
        init()
      }
    }
  }, [
    restartWithMessage,
    goodWallet,
    userStorage,
    initialize,
    setReady,
    showOutOfGasError,
    isLoggedInCitizen,
    isLoggedIn,
  ])

  const recheck = useCallback(() => {
    const { current: data } = deepLinkingRef

    if (data) {
      log.debug('deepLinkingNavigation: got url', { data })

      navigateToUrlAction({ path: data.path, params: data.queryParams })
      deepLinkingRef.current = null
    }

    if (ready && userStorage && goodWallet) {
      // TODO: do not call private methods, create single method sync()
      // in user storage class designed to be called from outside
      userStorage.database._syncFromRemote()
      userStorage.userProperties._syncFromRemote()
      refresh() //this will refresh the jwt token if wasnt active for a long time
      showOutOfGasError()
    }
  }, [ready, refresh, props, goodWallet, userStorage, showOutOfGasError, navigateToUrlAction])

  useAppState({ onForeground: recheck })

  useEffect(() => {
    initWalletAndStorage(undefined, 'SEED', true).then(() => log.debug('storage and wallet ready'))
  }, [initWalletAndStorage])

  useEffect(() => {
    const { initializedRegistered } = userStorage || {}

    if (!ready && initializedRegistered) {
      init()
      navigateToUrlAction()
    }

    if (ready || !isMobileNative) {
      return noop
    }

    DeepLinking.subscribe(data => {
      if (initializedRegistered && AppState.currentState === 'active') {
        log.debug('deepLinkingNavigation: got url', { data })
        navigateToUrlAction({ path: data.path, params: data.queryParams })
        return
      }

      deepLinkingRef.current = data
    })

    return DeepLinking.unsubscribe
  }, [ready, init, userStorage, navigateToUrlAction])

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
