// libraries
import React, { memo, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { pick } from 'lodash'

// components

import Splash, { animationDuration, shouldAnimateSplash } from './components/splash/Splash'

// hooks
import useUpdateDialog from './components/appUpdate/useUpdateDialog'
import useBrowserSupport from './components/browserSupport/hooks/useBrowserSupport'
import UnsupportedBrowser from './components/browserSupport/components/UnsupportedBrowser'

// utils
import SimpleStore from './lib/undux/SimpleStore'
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import DeepLinking from './lib/utils/deepLinking'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import isWebApp from './lib/utils/isWebApp'
import logger from './lib/logger/js-logger'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import handleLinks from './lib/utils/handleLinks'

const log = logger.child({ from: 'RouterSelector' })

// identify the case user signup/in using torus redirect flow, so we want to load page asap
const isAuthReload = DeepLinking.pathname.startsWith('/Welcome/Auth')

const DisconnectedSplash = () => <Splash animation={false} />

let SignupRouter = React.lazy(async () => {
  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(log),
    delay(isAuthReload ? 0 : animationDuration),
  ])

  return module
})

let AppRouter = React.lazy(async () => {
  const animateSplash = await shouldAnimateSplash()
  log.debug('initializing storage and wallet...', { animateSplash })

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    retryImport(() => import(/* webpackChunkName: "init" */ './init'))
      .then(({ init }) => init())
      .then(() => log.debug('storage and wallet ready')),
    delay(animateSplash ? animationDuration : 0),
  ])

  log.debug('router ready')
  return module
})

const NestedRouter = memo(({ isLoggedIn }) => {
  useUpdateDialog()

  useEffect(() => {
    let source, platform
    if (Platform.OS === 'web') {
      const params = DeepLinking.params

      source = document.referrer.match(/^https:\/\/(www\.)?gooddollar\.org/) == null ? source : 'web3'
      source = Object.keys(pick(params, ['inviteCode', 'paymentCode', 'code'])).pop() || source
      platform = isWebApp ? 'webapp' : 'web'
    } else {
      platform = 'native'
    }
    fireEvent(APP_OPEN, { source, platform, isLoggedIn })
    log.debug('RouterSelector Rendered', { isLoggedIn })

    if (isLoggedIn) {
      document.cookie = 'hasWallet=1;Domain=.gooddollar.org'
    }
  }, [isLoggedIn])

  return isLoggedIn ? (
    <AppRouter />
  ) : (
    <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={isLoggedIn}>
      <SignupRouter />
    </InternetConnection>
  )
})

const RouterSelector = () => {
  // we use global state for signup process to signal user has registered
  const store = SimpleStore.useStore()
  const isLoggedIn = store.get('isLoggedIn')
  const [ignoreUnsupported, setIgnoreUnsupported] = useState(false)
  const [checkedForBrowserSupport, setCheckedForBrowserSupport] = useState(false)

  let [supported, checkBrowser] = useBrowserSupport({
    checkOnMounted: false,
    unsupportedPopup: UnsupportedBrowser,
  })

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    //once user is logged in check if their browser is supported and show warning if not
    if (isLoggedIn) {
      checkBrowser()
    }
    setIgnoreUnsupported(true)
    setCheckedForBrowserSupport(true)
  }, [isLoggedIn])

  // starting animation once we're checked for browser support and awaited
  // the user dismissed warning dialog (if browser wasn't supported)
  return (
    <React.Suspense fallback={<Splash animation={!isAuthReload && checkedForBrowserSupport} isLoggedIn={isLoggedIn} />}>
      {(supported || ignoreUnsupported) && <NestedRouter isLoggedIn={isLoggedIn} />}
    </React.Suspense>
  )
}

export default RouterSelector
