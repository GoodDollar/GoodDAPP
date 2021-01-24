// libraries
import React, { memo, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { pick } from 'lodash'
import bip39 from 'bip39-light'
import AsyncStorage from './lib/utils/asyncStorage'

// components

import Splash, { animationDuration, shouldAnimateSplash } from './components/splash/Splash'

// hooks
import useUpgradeDialog from './lib/hooks/useUpgradeDialog'
import useBrowserSupport from './components/browserSupport/hooks/useBrowserSupport'
import UnsupportedBrowser from './components/browserSupport/components/UnsupportedBrowser'

// utils
import SimpleStore from './lib/undux/SimpleStore'
import { DESTINATION_PATH } from './lib/constants/localStorage'
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import DeepLinking from './lib/utils/deepLinking'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import isWebApp from './lib/utils/isWebApp'
import logger from './lib/logger/pino-logger'
import { APP_OPEN, fireEvent, initAnalytics, SIGNIN_FAILED, SIGNIN_SUCCESS } from './lib/analytics/analytics'
import restart from './lib/utils/restart'

const log = logger.child({ from: 'RouterSelector' })

const DisconnectedSplash = () => <Splash animation={false} />

/**
 * handle in-app links for unsigned users such as magiclink and paymentlinks
 * magiclink proceed to signin other links we keep and pop once user is logged in
 *
 * @returns {Promise<boolean>}
 */
const handleLinks = async () => {
  const params = DeepLinking.params

  try {
    const { magiclink } = params

    if (magiclink) {
      let userNameAndPWD = Buffer.from(decodeURIComponent(magiclink), 'base64').toString()
      let userNameAndPWDArray = userNameAndPWD.split('+')
      log.debug('recoverByMagicLink', { magiclink, userNameAndPWDArray })
      if (userNameAndPWDArray.length === 2) {
        const userName = userNameAndPWDArray[0]
        const userPwd = userNameAndPWDArray[1]
        const UserStorage = await retryImport(() => import('./lib/gundb/UserStorageClass')).then(_ => _.UserStorage)

        const mnemonic = await UserStorage.getMnemonic(userName, userPwd)

        if (mnemonic && bip39.validateMnemonic(mnemonic)) {
          const mnemonicsHelpers = retryImport(() => import('./lib/wallet/SoftwareWalletProvider'))
          const { saveMnemonics } = await mnemonicsHelpers
          await saveMnemonics(mnemonic)
          await AsyncStorage.setItem('GD_isLoggedIn', true)
          fireEvent(SIGNIN_SUCCESS)
          restart('/')
        }
      }
    } else {
      let path = window.location.pathname.slice(1)
      path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path

      if (params && Object.keys(params).length > 0) {
        const dest = { path, params }
        log.debug('Saving destination url', dest)
        await AsyncStorage.setItem(DESTINATION_PATH, dest)
      }
    }
  } catch (e) {
    if (params.magiclink) {
      log.error('Magiclink signin failed', e.message, e)
      fireEvent(SIGNIN_FAILED)
    } else {
      log.error('parsing in-app link failed', e.message, e, params)
    }
  }
}

let SignupRouter = React.lazy(async () => {
  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(),
    delay(animationDuration),
  ])
  module.default = module.default()
  return module
})

let AppRouter = React.lazy(async () => {
  const animateSplash = await shouldAnimateSplash()
  log.debug('initializing storage and wallet...', { animateSplash })

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    retryImport(() => import(/* webpackChunkName: "init" */ './init'))
      .then(({ init }) => init())
      .then(() => log.debug('storage and wallet ready')),
    delay(animateSplash ? animationDuration : 0),
  ])

  log.debug('router ready')
  return module
})

const NestedRouter = memo(({ isLoggedIn }) => {
  useUpgradeDialog()

  useEffect(() => {
    let source, platform
    if (Platform.OS === 'web') {
      const params = DeepLinking.params

      source = document.referrer.match(/^https:\/\/(www\.)?gooddollar\.org/) == null ? source : 'web3'
      source = Object.keys(pick(params, ['inviteCode', 'paymentCode', 'code'])).pop() || source
      platform = isWebApp ? 'webapp' : 'web'
    } else {
      platform = 'native'
    }
    fireEvent(APP_OPEN, { source, platform, isLoggedIn })
    log.debug('RouterSelector Rendered', { isLoggedIn })

    if (isLoggedIn) {
      document.cookie = 'hasWallet=1;Domain=.gooddollar.org'
    }
  }, [isLoggedIn])

  return isLoggedIn ? (
    <AppRouter />
  ) : (
    <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={isLoggedIn}>
      <SignupRouter />
    </InternetConnection>
  )
})

const RouterSelector = () => {
  // we use global state for signup process to signal user has registered
  const store = SimpleStore.useStore()
  const isLoggedIn = store.get('isLoggedIn')
  const [ignoreUnsupported, setIgnoreUnsupported] = useState(false)
  const [checkedForBrowserSupport, setCheckedForBrowserSupport] = useState(false)

  let [supported, checkBrowser] = useBrowserSupport({
    checkOnMounted: false,
    unsupportedPopup: UnsupportedBrowser,
  })

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    //once user is logged in check if their browser is supported and show warning if not
    if (isLoggedIn) {
      checkBrowser()
    }
    setIgnoreUnsupported(true)
    setCheckedForBrowserSupport(true)
  }, [isLoggedIn])

  // statring anumation once we're checked for browser support and awaited
  // the user dismissed warning dialog (if browser wasn't supported)
  return (
    <React.Suspense fallback={<Splash animation={checkedForBrowserSupport} isLoggedIn={isLoggedIn} />}>
      {(supported || ignoreUnsupported) && <NestedRouter isLoggedIn={isLoggedIn} />}
    </React.Suspense>
  )
}

export default RouterSelector
