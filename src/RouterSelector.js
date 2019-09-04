import React, { useEffect } from 'react'
import { AsyncStorage } from 'react-native'
import { DESTINATION_PATH } from './lib/constants/localStorage'
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
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem(IS_LOGGED_IN))

  log.debug('RouterSelector Rendered', { isLoggedIn })
  const Router = isLoggedIn ? AppRouter : SignupRouter

  //save "in-app" links for non logged in to be poped later once logged in
  useEffect(() => {
    if (isLoggedIn === true) {
      return
    }
    const params = extractQueryParams(window.location.href)
    if (params && Object.keys(params).length > 0) {
      const dest = { path: window.location.pathname.slice(1), params }
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
