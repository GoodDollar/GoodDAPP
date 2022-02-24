import React, { useContext, useMemo } from 'react'

import Splash, { animationDuration } from './components/splash/Splash'
import useUpdateDialog from './components/appUpdate/useUpdateDialog'

import SimpleStore from './lib/undux/SimpleStore'

import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import handleLinks from './lib/utils/handleLinks'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'

import Config from './config/config'
import logger from './lib/logger/js-logger'
import './lib/utils/debugUserAgent'
import { GoodWalletContext } from './lib/wallet/GoodWalletProvider'

const log = logger.child({ from: 'RouterSelector' })

log.debug({ Config })

// import Router from './SignupRouter'
let SignupRouter = React.lazy(async () => {
  await initAnalytics()
  fireEvent(APP_OPEN, { platform: 'native', isLoggedIn: false })
  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(log),
    delay(animationDuration),
  ])

  return module
})

let AppRouter = React.lazy(() => {
  log.debug('initializing storage and wallet...')
  let p1 = initAnalytics().then(() => fireEvent(APP_OPEN, { platform: 'native', isLoggedIn: true }))

  //always wait for full splash on native
  return Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
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
  const { initWalletAndStorage } = useContext(GoodWalletContext)

  useUpdateDialog()

  //we use global state for signup process to signal user has registered
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem(IS_LOGGED_IN))

  const Router = useMemo(() => {
    log.debug('RouterSelector Rendered', { isLoggedIn })

    if (isLoggedIn) {
      initWalletAndStorage(undefined, 'SEED').then(() => log.debug('storage and wallet ready'))
    }
    return isLoggedIn ? AppRouter : SignupRouter
  }, [isLoggedIn])

  return (
    <React.Suspense fallback={<Splash animation />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
