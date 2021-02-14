import React, { useMemo } from 'react'
import bip39 from 'bip39-light'
import AsyncStorage from './lib/utils/asyncStorage'
import SimpleStore from './lib/undux/SimpleStore'
import Splash, { animationDuration } from './components/splash/Splash'
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import logger from './lib/logger/pino-logger'
import { APP_OPEN, fireEvent, initAnalytics, SIGNIN_FAILED, SIGNIN_SUCCESS } from './lib/analytics/analytics'
import Config from './config/config'
import restart from './lib/utils/restart'
import DeepLinking from './lib/utils/deepLinking'

// hooks
import { savePathToStorage } from './lib/hooks/useSavePathToStorage'

const { useSavePathToStorage } = savePathToStorage()

const log = logger.child({ from: 'RouterSelector' })
log.debug({ Config })

// import Router from './SignupRouter'
let SignupRouter = React.lazy(async () => {
  const { params } = DeepLinking
  await initAnalytics()
  fireEvent(APP_OPEN, { platform: 'native', isLoggedIn: false })
  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(),
    useSavePathToStorage(params, log),
    delay(animationDuration),
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

  log.debug('handleLinks:', { params })
  try {
    const { magiclink } = params
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
  let p1 = initAnalytics().then(() => fireEvent(APP_OPEN, { platform: 'native', isLoggedIn: true }))
  let walletAndStorageReady = retryImport(() => import(/* webpackChunkName: "init" */ './init'))
  let p2 = walletAndStorageReady.then(({ init, _ }) => init()).then(_ => log.debug('storage and wallet ready'))

  //always wait for full splash on native
  return Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    p2,
    p1,
    delay(animationDuration),
  ])
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
