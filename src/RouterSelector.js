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
  Promise.all([
    import(/* webpackChunkName: "signuprouter" */ './SignupRouter'),
    recoverByMagicLink(),
    delay(2000),
  ]).then(r => r[0])
)

/**
 * Recover user by MagicLink
 *
 * @returns {Promise<boolean>}
 */
const recoverByMagicLink = async () => {
  const { magicline } = extractQueryParams(window.location.href)
  if (magicline) {
    let userNameAndPWD = Buffer.from(magicline, 'base64').toString('ascii')
    let userNameAndPWDArray = userNameAndPWD.split('+')
    log.debug('recoverByMagicLink', { magicline, userNameAndPWDArray })
    if (userNameAndPWDArray.length === 2) {
      const userName = userNameAndPWDArray[0]
      const userPwd = userNameAndPWDArray[1]
      const UserStorage = await import('./lib/gundb/UserStorageClass').then(_ => _.UserStorage)

      const mnemonic = await UserStorage.getMnemonic(userName, userPwd)

      if (mnemonic && bip39.validateMnemonic(mnemonic)) {
        const mnemonicsHelpers = import('./lib/wallet/SoftwareWalletProvider')
        const { saveMnemonics } = await mnemonicsHelpers
        await saveMnemonics(mnemonic)
        await AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)
        window.location = '/'
      }
    }
  }
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

  //we use global state for signup process to signal user has registered
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem('GOODDAPP_isLoggedIn'))

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
