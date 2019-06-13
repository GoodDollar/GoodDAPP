import React from 'react'
import { AsyncStorage } from 'react-native'
import SimpleStore from './lib/undux/SimpleStore'
import Splash from './components/splash/Splash'
import { delay } from './lib/utils/async'

const RouterSelector = () => {
  const store = SimpleStore.useStore()
  //we use global state for signup process to signal user has registered
  const isLoggedIn = Promise.resolve(store.get('isLoggedIn') || AsyncStorage.getItem('GOODDAPP_isLoggedIn'))

  let router = isLoggedIn.then(_ =>
    _
      ? import(/* webpackChunkName: "router", webpackPrefetch: true */ './Router')
      : import(/* webpackChunkName: "signuprouter" */ './SignupRouter')
  )
  //if not logged in dont wait for wallet/storage to be ready
  let Router = React.lazy(async () => {
    if (await isLoggedIn) {
      let walletAndStorageReady = import(/* webpackChunkName: "init-wallet-storage", webpackPrefetch: true */ './init')
      await walletAndStorageReady.then(({ init, _ }) => init())
    } else await delay(2000)
    return router
  })

  return (
    <React.Suspense fallback={<Splash />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
