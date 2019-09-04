import React, { useEffect } from 'react'
import { AsyncStorage } from 'react-native'
import bip39 from 'bip39-light'
import SimpleStore from './lib/undux/SimpleStore'
import Splash from './components/splash/Splash'
import { delay } from './lib/utils/async'
import { extractQueryParams } from './lib/share/index'
import logger from './lib/logger/pino-logger'

const log = logger.child({ from: 'RouterSelector' })

// import Router from './SignupRouter'
let SignupRouter = React.lazy(() =>
  Promise.all([delay(2000), import(/* webpackChunkName: "signuprouter" */ './SignupRouter')]).then(r => r[1])
)

/**
 * Recover user by MagicLink
 *
 * @param {string} magicline
 *
 * @returns {Promise<boolean>}
 */
const recoverByMagicLink = async magicline => {
  let userNameAndPWD = Buffer.from(magicline, 'base64').toString('ascii')
  let userNameAndPWDArray = userNameAndPWD.split('+')
  if (userNameAndPWDArray.length === 2) {
    const userName = userNameAndPWDArray[0]
    const userPwd = userNameAndPWDArray[1]
    const [UserStorage, Wallet] = await Promise.all([
      import('./lib/gundb/UserStorageClass').then(_ => _.UserStorage),
      import('./lib/wallet/GoodWalletClass').then(_ => _.GoodWallet),
    ])

    const mnemonic = await UserStorage.getMnimonic(userName, userPwd)

    if (mnemonic && bip39.validateMnemonic(mnemonic)) {
      const mnemonicsHelpers = import('./lib/wallet/SoftwareWalletProvider')
      const { saveMnemonics } = await mnemonicsHelpers
      await saveMnemonics(mnemonic)
      const wallet = new Wallet({ mnemonic: mnemonic })
      await wallet.ready
      const userStorage = new UserStorage(wallet)
      await userStorage.ready
      const exists = await userStorage.userAlreadyExist()
      if (exists) {
        await AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)
        window.location = '/'
        return true
      }
    }
  }

  return false
}

let AppRouter = React.lazy(() => {
  log.debug('initializing storage and wallet...')
  let walletAndStorageReady = import(/* webpackChunkName: "init" */ './init')
  let p2 = walletAndStorageReady.then(({ init, _ }) => init()).then(_ => log.debug('storage and wallet ready'))
  return Promise.all([p2, import(/* webpackChunkName: "router" */ './Router')])
    .then(r => {
      log.debug('router ready')
      return r
    })
    .then(r => r[1])
})

const RouterSelector = () => {
  const store = SimpleStore.useStore()

  const params = extractQueryParams(window.location.href)

  //we use global state for signup process to signal user has registered
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem('GOODDAPP_isLoggedIn'))

  if (!isLoggedIn && params.magicline) {
    recoverByMagicLink(params.magicline)
  }

  log.debug('RouterSelector Rendered', { isLoggedIn })
  const Router = isLoggedIn ? AppRouter : SignupRouter

  // save "in-app" links for non logged in to be poped later once logged in
  useEffect(() => {
    if (isLoggedIn === true) {
      return
    }
    const params = extractQueryParams(window.location.href)
    if (params && Object.keys(params).length > 0) {
      const dest = { path: window.location.pathname.slice(1), params }
      log.debug('Saving destination url', dest)
      AsyncStorage.setItem('destinationPath', JSON.stringify(dest))
    }
  }, [])
  return (
    <React.Suspense fallback={<Splash />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
