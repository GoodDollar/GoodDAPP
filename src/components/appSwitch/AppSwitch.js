// @flow
import React, { useEffect, useState } from 'react'
import { AppState, AsyncStorage, Platform } from 'react-native'
import { SceneView } from '@react-navigation/core'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import moment from 'moment'
import { DESTINATION_PATH } from '../../lib/constants/localStorage'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { updateAll as updateWalletStatus } from '../../lib/undux/utils/account'
import { checkAuthStatus as getLoginState } from '../../lib/login/checkAuthStatus'
import userStorage from '../../lib/gundb/UserStorage'
import runUpdates from '../../lib/updates'

import Splash from '../splash/Splash'
import config from '../../config/config'

type LoadingProps = {
  navigation: any,
  descriptors: any,
}

const log = logger.child({ from: 'AppSwitch' })

const MIN_BALANCE_VALUE = '100000'
const GAS_CHECK_DEBOUNCE_TIME = 1000
const showOutOfGasError = _debounce(
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
  }
)

let unsuccessfulLaunchAttempts = 0

/**
 * The main app route rendering component. Here we decide where to go depending on the user's credentials status
 */
const AppSwitch = (props: LoadingProps) => {
  const gdstore = GDStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const { router, state } = props.navigation
  const [ready, setReady] = useState(false)

  /*
  Check if user is incoming with a URL with action details, such as payment link or email confirmation
  */
  const getParams = async () => {
    // const navInfo = router.getPathAndParamsForState(state)
    const destinationPath = await AsyncStorage.getItem(DESTINATION_PATH).then(JSON.parse)
    AsyncStorage.removeItem(DESTINATION_PATH)

    // FIXME: RN
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

  const init = async (retries = 3) => {
    log.debug('initializing', gdstore)

    try {
      await initialize()

      //we only need feed once user logs in, so this is not in userstorage.init
      userStorage.startSystemFeed()
      await Promise.all([runUpdates(), prepareLoginToken(), checkBonusInterval(), showOutOfGasError(props)])

      setReady(true)
    } catch (e) {
      log.error('failed initializing app', e.message, e)
      unsuccessfulLaunchAttempts += 1
      if (unsuccessfulLaunchAttempts > 1) {
        showErrorDialog('Wallet could not be loaded. Please try again later.', '', {
          onDismiss: init,
        })
      } else {
        init()
      }
    }
  }

  const prepareLoginToken = async () => {
    if (config.isEToro !== true) {
      return
    }
    const loginToken = await userStorage.getProfileFieldValue('loginToken')
    log.info('Prepare login token process started', loginToken)

    if (!loginToken) {
      try {
        const response = await API.getLoginToken()

        const _loginToken = _get(response, 'data.loginToken')

        if (_loginToken) {
          await userStorage.setProfileField('loginToken', _loginToken, 'private')
        }
      } catch (e) {
        log.error('prepareLoginToken failed', e.message, e)
      }
    }
  }

  const checkBonusInterval = async perform => {
    if (config.isEToro !== true) {
      return
    }
    const lastTimeBonusCheck = await userStorage.userProperties.get('lastBonusCheckDate')
    const isUserWhitelisted = gdstore.get('isLoggedInCitizen') || (await goodWallet.isCitizen())

    log.debug({ lastTimeBonusCheck, isUserWhitelisted, gdstore })
    if (
      isUserWhitelisted !== true ||
      (lastTimeBonusCheck &&
        moment()
          .subtract(Number(config.backgroundReqsInterval), 'minutes')
          .isBefore(moment(lastTimeBonusCheck)))
    ) {
      return
    }
    userStorage.userProperties.set('lastBonusCheckDate', new Date().toISOString())
    await checkBonusesToRedeem()
  }

  const checkBonusesToRedeem = () => {
    log.debug('Check bonuses process started')
    return API.redeemBonuses()
      .then(res => {
        log.info('redeemBonuses', { resData: res && res.data })
      })
      .catch(err => {
        log.error('Failed to redeem bonuses', err.message, err)

        // showErrorDialog('Something Went Wrong. An error occurred while trying to redeem bonuses')
      })
  }

  const handleAppFocus = state => {
    if (state === 'active') {
      checkBonusInterval()
      showOutOfGasError(props)
    }
  }

  useEffect(() => {
    init()
    navigateToUrlAction()
  }, [])

  useEffect(() => {
    AppState.addEventListener('change', handleAppFocus)

    return function() {
      AppState.removeEventListener('change', handleAppFocus)
    }
  }, [gdstore, handleAppFocus])

  const { descriptors, navigation } = props
  const activeKey = navigation.state.routes[navigation.state.index].key
  const descriptor = descriptors[activeKey]
  const display = ready ? (
    <SceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
  ) : (
    <Splash />
  )
  return <React.Fragment>{display}</React.Fragment>
}

export default AppSwitch
