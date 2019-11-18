import React, { useEffect } from 'react'
import { AsyncStorage } from 'react-native'
import bip39 from 'bip39-light'
import { DESTINATION_PATH } from './lib/constants/localStorage'
import SimpleStore from './lib/undux/SimpleStore'
import Splash from './components/splash/Splash'
import { delay } from './lib/utils/async'
import { extractQueryParams } from './lib/share/index'
import logger from './lib/logger/pino-logger'
import { fireEvent, initAnalytics, SIGNIN_FAILED, SIGNIN_SUCCESS } from './lib/analytics/analytics'
import Config from './config/config'

const log = logger.child({ from: 'RouterSelector' })
log.debug({ Config })

// import Router from './SignupRouter'
let SignupRouter = React.lazy(() =>
  initAnalytics()
    .then(_ =>
      Promise.all([import(/* webpackChunkName: "signuprouter" */ './SignupRouter'), recoverByMagicLink(), delay(2000)])
    )
    .then(r => r[0])
)

/**
 * Recover user by MagicLink
 *
 * @returns {Promise<boolean>}
 */
const recoverByMagicLink = async () => {
  try {
    const { magiclink } = extractQueryParams(window.location.href)
    if (magiclink) {
      let userNameAndPWD = Buffer.from(magiclink, 'base64').toString('ascii')
      let userNameAndPWDArray = userNameAndPWD.split('+')
      log.debug('recoverByMagicLink', { magiclink, userNameAndPWDArray })
      if (userNameAndPWDArray.length === 2) {
        const userName = userNameAndPWDArray[0]
        const userPwd = userNameAndPWDArray[1]
        const UserStorage = await import('./lib/gundb/UserStorageClass').then(_ => _.UserStorage)

        const mnemonic = await UserStorage.getMnemonic(userName, userPwd)

        if (mnemonic && bip39.validateMnemonic(mnemonic)) {
          const mnemonicsHelpers = import('./lib/wallet/SoftwareWalletProvider')
          const { saveMnemonics } = await mnemonicsHelpers
          await saveMnemonics(mnemonic)
          await AsyncStorage.setItem('GD_isLoggedIn', true)
          fireEvent(SIGNIN_SUCCESS)
          window.location = '/'
        }
      }
    }
  } catch (e) {
    log.error('Magiclink signin failed', e.message, e)
    fireEvent(SIGNIN_FAILED)
  }
}

let AppRouter = React.lazy(() => {
  log.debug('initializing storage and wallet...')
  let walletAndStorageReady = import(/* webpackChunkName: "init" */ './init')
  let p2 = walletAndStorageReady.then(({ init, _ }) => init()).then(_ => log.debug('storage and wallet ready'))
  return Promise.all([import(/* webpackChunkName: "router" */ './Router'), p2])
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

  log.debug('RouterSelector Rendered', { isLoggedIn })
  const Router = isLoggedIn ? AppRouter : SignupRouter

  //save "in-app" links for non logged in to be poped later once logged in
  useEffect(() => {
    if (isLoggedIn === true) {
      return
    }
    const params = extractQueryParams(window.location.href)

    if (params.web3) {
      AsyncStorage.setItem('GD_web3Token', params.web3)
    }
    const path = window.location.pathname.slice(1)
    if ((params && Object.keys(params).length > 0) || path.indexOf('Marketplace') >= 0) {
      const dest = { path, params }
      log.debug('Saving destination url', dest)
      AsyncStorage.setItem(DESTINATION_PATH, JSON.stringify(dest))
    }
  }, [])
  return (
    <React.Suspense fallback={<Splash />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
