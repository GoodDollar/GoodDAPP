// libraries
import React, { memo, useEffect } from 'react'
import { AsyncStorage } from 'react-native'
import bip39 from 'bip39-light'

// components
import Splash, { animationDuration } from './components/splash/Splash'

// hooks
import useUpgradeDialog from './lib/hooks/useUpgradeDialog'

// utils
import SimpleStore from './lib/undux/SimpleStore'
import { DESTINATION_PATH } from './lib/constants/localStorage'
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import { extractQueryParams } from './lib/share/index'
import logger from './lib/logger/pino-logger'
import { fireEvent, initAnalytics, SIGNIN_FAILED, SIGNIN_SUCCESS } from './lib/analytics/analytics'

const log = logger.child({ from: 'RouterSelector' })

/**
 * handle in-app links for unsigned users such as magiclink and paymentlinks
 * magiclink proceed to signin other links we keep and pop once user is logged in
 *
 * @returns {Promise<boolean>}
 */
const handleLinks = async () => {
  const decodedHref = decodeURI(window.location.href)
  const params = extractQueryParams(decodedHref)

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
          window.location = '/'
        }
      }
    } else {
      if (params.web3) {
        await AsyncStorage.setItem('GD_web3Token', params.web3)
        delete params.web3
      }

      let path = window.location.pathname.slice(1)
      path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path

      if ((params && Object.keys(params).length > 0) || path.indexOf('Marketplace') >= 0) {
        const dest = { path, params }
        log.debug('Saving destination url', dest)
        await AsyncStorage.setItem(DESTINATION_PATH, JSON.stringify(dest))
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
  await initAnalytics()

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(),
    delay(animationDuration),
  ])

  return module
})

let AppRouter = React.lazy(async () => {
  log.debug('initializing storage and wallet...')

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    retryImport(() => import(/* webpackChunkName: "init" */ './init'))
      .then(({ init }) => init())
      .then(() => log.debug('storage and wallet ready')),

  ])

  log.debug('router ready')
  return module
})

const NestedRouter = memo(({ isLoggedIn }) => {
  useUpgradeDialog()

  useEffect(() => {
    log.debug('RouterSelector Rendered', { isLoggedIn })
  }, [isLoggedIn])

  return isLoggedIn ? <AppRouter /> : <SignupRouter />
})

const RouterSelector = () => {
  // we use global state for signup process to signal user has registered
  const store = SimpleStore.useStore()
  const isLoggedIn = store.get('isLoggedIn')

  return (
    <React.Suspense fallback={<Splash animation />}>
      <NestedRouter isLoggedIn={isLoggedIn} />
    </React.Suspense>
  )
}

export default RouterSelector
