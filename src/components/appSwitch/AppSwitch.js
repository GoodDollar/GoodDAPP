// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { SceneView } from '@react-navigation/core'
import { debounce } from 'lodash'
import moment from 'moment'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { DESTINATION_PATH, GD_USER_MASTERSEED } from '../../lib/constants/localStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../lib/constants/login'

import logger from '../../lib/logger/pino-logger'
import API, { getErrorMessage } from '../../lib/API/api'
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
import SimpleStore, { assertStore } from '../../lib/undux/SimpleStore'
import { preloadZoomSDK } from '../dashboard/FaceVerification/hooks/useZoomSDK'
import DeepLinking from '../../lib/utils/deepLinking'
import { isMobileNative } from '../../lib/utils/platform'

type LoadingProps = {
  navigation: any,
  descriptors: any,
}

const log = logger.child({ from: 'AppSwitch' })

const MIN_BALANCE_VALUE = '100000'
const GAS_CHECK_DEBOUNCE_TIME = 1000
const showOutOfGasError = debounce(
  async props => {
    const gasResult = await goodWallet.verifyHasGas(goodWallet.wallet.utils.toWei(MIN_BALANCE_VALUE, 'gwei'), {
      topWallet: false,
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
  const [ready, setReady] = useState(false)
  const { appState } = useAppState()

  const recheck = useCallback(() => {
    if (ready && gdstore) {
      checkBonusInterval(true)
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
  const getParams = async () => {
    // const navInfo = router.getPathAndParamsForState(state)
    const destinationPath = await AsyncStorage.getItem(DESTINATION_PATH)
    AsyncStorage.removeItem(DESTINATION_PATH)

    // FIXME: RN INAPPLINKS
    if (Platform.OS !== 'web') {
      return undefined
    }

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
  const initialize = async isLoggedInCitizen => {
    AsyncStorage.setItem('GD_version', 'phase' + config.phase)

    // gdstore.set('inviteCode')(inviteCode)
    const regMethod = (await AsyncStorage.getItem(GD_USER_MASTERSEED).then(_ => !!_))
      ? REGISTRATION_METHOD_TORUS
      : REGISTRATION_METHOD_SELF_CUSTODY
    store.set('regMethod')(regMethod)

    const email = await userStorage.getProfileFieldValue('email')
    identifyWith(email, undefined)

    if (isLoggedInCitizen) {
      API.verifyTopWallet().catch(e => {
        const message = getErrorMessage(e)
        const exception = new Error(message)

        log.error('verifyTopWallet failed', message, exception)
      })
    }

    // preloading Zoom (supports web + native)
    if (isLoggedInCitizen === false) {
      // don't awaiting for sdk ready here
      // initialize() will await if preload hasn't completed yet
      preloadZoomSDK(log) // eslint-disable-line require-await
    }
  }

  const init = async () => {
    log.debug('initializing')

    try {
      //after dynamic routes update, if user arrived here, then he is already loggedin
      //initialize the citizen status and wallet status
      const [{ isLoggedInCitizen, isLoggedIn }] = await Promise.all([
        getLoginState(),
        updateWalletStatus(gdstore),

        // userStorage.getProfileFieldValue('inviteCode'),
      ])
      log.debug('initialize ready', { isLoggedIn, isLoggedInCitizen })

      gdstore.set('isLoggedIn')(isLoggedIn)
      gdstore.set('isLoggedInCitizen')(isLoggedInCitizen)

      //identify user asap for analytics
      const identifier = goodWallet.getAccountForType('login')
      identifyWith(undefined, identifier)

      initialize(isLoggedInCitizen)
      runUpdates()
      showOutOfGasError(props)

      setReady(true)
    } catch (e) {
      const dialogShown = unsuccessfulLaunchAttempts > 3

      unsuccessfulLaunchAttempts += 1

      if (dialogShown) {
        //TODO: FIX window.location for RN
        log.error('failed initializing app', e.message, e, { dialogShown })
        showErrorDialog('Wallet could not be loaded. Please refresh.', '', { onDismiss: () => (window.location = '/') })
      } else {
        await delay(1500)
        init()
      }
    }
  }

  const checkBonusInterval = async force => {
    if (config.enableInvites !== true || config.isPhaseOne) {
      return
    }

    if (!assertStore(gdstore, log, 'checkBonusInterval failed')) {
      return
    }

    const lastTimeBonusCheck = await userStorage.userProperties.get('lastBonusCheckDate')
    const isUserWhitelisted = gdstore.get('isLoggedInCitizen') || (await goodWallet.isCitizen())

    log.debug({ lastTimeBonusCheck, isUserWhitelisted, gdstore })
    if (
      isUserWhitelisted !== true ||
      (force !== true &&
        lastTimeBonusCheck &&
        moment()
          .subtract(Number(config.backgroundReqsInterval), 'minutes')
          .isBefore(moment(lastTimeBonusCheck)))
    ) {
      return
    }
    await userStorage.userProperties.set('lastBonusCheckDate', new Date().toISOString())
    await checkBonusesToRedeem()
  }

  const checkBonusesToRedeem = () => {
    log.debug('Check bonuses process started')
    return API.redeemBonuses()
      .then(res => {
        log.info('redeemBonuses', { resData: res && res.data })
      })
      .catch(err => {
        const message = getErrorMessage(err)
        log.error('Failed to redeem bonuses', message, err)

        // showErrorDialog('Something Went Wrong. An error occurred while trying to redeem bonuses')
      })
  }

  const deepLinkingNavigation = () => props.navigation.navigate(DeepLinking.pathname.slice(1))

  useEffect(() => {
    init()
    navigateToUrlAction()
  }, [])

  //Pushing users to the path when signing in.
  useEffect(() => {
    if (isMobileNative && DeepLinking.pathname) {
      deepLinkingNavigation()
    }
  }, [])

  useEffect(() => {
    if (!isMobileNative || !appState === 'active') {
      return
    }

    // DeepLinking.subscribe(deepLinkingNavigation)
    return () => DeepLinking.unsubscribe()
  }, [DeepLinking.pathname, appState])

  useEffect(() => {
    if (ready && gdstore && appState === 'active') {
      checkBonusInterval(true)
      showOutOfGasError(props)
    }
  }, [gdstore, ready, appState])

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
