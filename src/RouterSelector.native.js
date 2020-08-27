import React, { useMemo } from 'react'
import bip39 from 'bip39-light'
import AsyncStorage from './lib/utils/asyncStorage'
import { DESTINATION_PATH } from './lib/constants/localStorage'
import SimpleStore from './lib/undux/SimpleStore'
import Splash from './components/splash/Splash'
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import logger from './lib/logger/pino-logger'
import { fireEvent, initAnalytics } from './lib/analytics/analytics'
import { SIGNIN_FAILED, SIGNIN_SUCCESS } from './lib/analytics/constants'
import Config from './config/config'
import restart from './lib/utils/restart'
import DeepLinking from './lib/utils/deepLinking'

const log = logger.child({ from: 'RouterSelector' })
log.debug({ Config })

// import Router from './SignupRouter'
let SignupRouter = React.lazy(async () => {
  await initAnalytics()

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(),
    delay(5000),
  ])

  return module
})

/**
 * handle in-app links for unsigned users such as magiclink and paymentlinks
 * magiclink proceed to signin other links we keep and pop once user is logged in
 *
 * @returns {Promise<boolean>}
 */
const handleLinks = async () => {
  const { params } = DeepLinking

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
          await AsyncStorage.setItem('GD_isLoggedIn', 'true')
          fireEvent(SIGNIN_SUCCESS)
          restart()
        }
      }
    } else {
      if (params.web3) {
        await AsyncStorage.setItem('GD_web3Token', params.web3)
        delete params.web3
      }
      let path = DeepLinking.pathname.slice(1)
      path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path
      if ((params && Object.keys(params).length > 0) || path.indexOf('Marketplace') >= 0) {
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

let AppRouter = React.lazy(() => {
  log.debug('initializing storage and wallet...')
  let walletAndStorageReady = retryImport(() => import(/* webpackChunkName: "init" */ './init'))
  let p2 = walletAndStorageReady.then(({ init, _ }) => init()).then(_ => log.debug('storage and wallet ready'))

  return Promise.all([retryImport(() => import(/* webpackChunkName: "router" */ './Router')), p2])
    .then(r => {
      log.debug('router ready')
      return r
    })
    .then(r => r[0])
})

const RouterSelector = () => {
  const store = SimpleStore.useStore()

  //we use global state for signup process to signal user has registered
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem(IS_LOGGED_IN))

  const Router = useMemo(() => {
    log.debug('RouterSelector Rendered', { isLoggedIn })
    return isLoggedIn ? AppRouter : SignupRouter
  }, [isLoggedIn])

  return (
    <React.Suspense fallback={<Splash animation />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
