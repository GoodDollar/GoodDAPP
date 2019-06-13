import React from 'react'
import SimpleStore from './lib/undux/SimpleStore'
import Splash from './components/splash/Splash'
import { delay } from './lib/utils/async'

const RouterSelector = () => {
  const store = SimpleStore.useStore()
  const isLoggedIn = store.get('isLoggedIn')

  let router = isLoggedIn
    ? import(/* webpackChunkName: "router", webpackPrefetch: true */ './Router')
    : import(/* webpackChunkName: "signuprouter" */ './SignupRouter')
  //   let walletAndStorageReady = import('./init' /* webpackChunkName: "init-wallet-storage", webpackPrefetch: true */)
  //   walletAndStorageReady = walletAndStorageReady.then(({ init, _ }) => init())
  //if not logged in dont wait for wallet/storage to be ready
  let Router = React.lazy(async () => {
    // if (await isLoggedIn) await walletAndStorageReady
    await delay(2000)
    return router
  })

  return (
    <React.Suspense fallback={<Splash />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
