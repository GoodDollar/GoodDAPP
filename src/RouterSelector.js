import React from 'react'
import { AsyncStorage } from 'react-native'
import SimpleStore from './lib/undux/SimpleStore'
import Splash from './components/splash/Splash'
import { delay } from './lib/utils/async'
// import Router from './SignupRouter'
let SignupRouter = React.lazy(() =>
  Promise.all([delay(2000), import(/* webpackChunkName: "signuprouter" */ './SignupRouter')]).then(r => r[1])
)
let AppRouter = React.lazy(() => {
  let walletAndStorageReady = import(/* webpackChunkName: "init", webpackPrefetch: true */ './init')
  let p2 = walletAndStorageReady.then(({ init, _ }) => init())
  return Promise.all([p2, import(/* webpackChunkName: "router", webpackPrefetch: true */ './Router')]).then(r => r[1])
})
const RouterSelector = () => {
  console.log('RouterRendered')
  const store = SimpleStore.useStore()
  //we use global state for signup process to signal user has registered
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem('GOODDAPP_isLoggedIn'))
  const Router = isLoggedIn ? AppRouter : SignupRouter
  // let router = isLoggedIn.then(_ =>
  //   _
  //     ? import(/* webpackChunkName: "router", webpackPrefetch: true */ './Router')
  //     : import(/* webpackChunkName: "signuprouter" */ './SignupRouter')
  // )
  // //if not logged in dont wait for wallet/storage to be ready
  // let Router = React.lazy(async () => {
  //   if (await isLoggedIn) {
  //     let walletAndStorageReady = import(/* webpackChunkName: "init-wallet-storage", webpackPrefetch: true */ './init')
  //     await walletAndStorageReady.then(({ init, _ }) => init())
  //   } else await delay(2000)
  //   return router
  // })

  return (
    <React.Suspense fallback={<Splash />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
