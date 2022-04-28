// libraries
import React, { memo, useContext, useEffect, useState } from 'react'
import { pick } from 'lodash'

// components

import Splash, { animationDuration, shouldAnimateSplash } from './components/splash/Splash'

// hooks
import useUpdateDialog from './components/appUpdate/useUpdateDialog'
import useBrowserSupport from './components/browserSupport/hooks/useBrowserSupport'
import UnsupportedBrowser from './components/browserSupport/components/UnsupportedBrowser'

// utils
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import DeepLinking from './lib/utils/deepLinking'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import isWebApp from './lib/utils/isWebApp'
import logger from './lib/logger/js-logger'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import { GoodWalletContext } from './lib/wallet/GoodWalletProvider'
import { GlobalTogglesContext } from './lib/contexts/togglesContext'
import { handleLinks } from './lib/utils/linking'

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
  const animateSplash = await shouldAnimateSplash(isAuthReload)

  log.debug('initializing storage and wallet...', { animateSplash })

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    delay(animateSplash ? animationDuration : 0),
  ])

  log.debug('router ready')
  return module
})

const NestedRouter = memo(({ isLoggedIn }) => {
  useUpdateDialog()

  useEffect(() => {
    let source, platform, params
    params = DeepLinking.params

    source = document.referrer.match(/^https:\/\/(www\.)?gooddollar\.org/) == null ? source : 'web3'
    source = Object.keys(pick(params, ['inviteCode', 'paymentCode', 'code'])).pop() || source
    platform = isWebApp ? 'webapp' : 'web'

    fireEvent(APP_OPEN, { source, platform, isLoggedIn, params })
    log.debug('RouterSelector Rendered', { isLoggedIn, params, source, platform })

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
  const { initWalletAndStorage } = useContext(GoodWalletContext)
  const { isLoggedInRouter } = useContext(GlobalTogglesContext)

  // we use global state for signup process to signal user has registered
  const [ignoreUnsupported, setIgnoreUnsupported] = useState(false)
  const [checkedForBrowserSupport, setCheckedForBrowserSupport] = useState(false)

  let [supported, checkBrowser] = useBrowserSupport({
    checkOnMounted: false,
    unsupportedPopup: UnsupportedBrowser,
  })

  useEffect(() => {
    log.debug('on mount')
    initAnalytics()
  }, [])

  useEffect(() => {
    log.debug('initWalletStorage', { isLoggedInRouter })

    if (!isLoggedInRouter) {
      return
    }

    initWalletAndStorage(undefined, 'SEED').then(() => log.debug('storage and wallet ready'))
  }, [isLoggedInRouter, initWalletAndStorage])

  useEffect(() => {
    // once user is logged in check if their browser is supported and show warning if not
    if (isLoggedInRouter) {
      checkBrowser()
    }

    setIgnoreUnsupported(true)
    setCheckedForBrowserSupport(true)
  }, [isLoggedInRouter, checkBrowser, setIgnoreUnsupported, setCheckedForBrowserSupport])

  // starting animation once we're checked for browser support and awaited
  // the user dismissed warning dialog (if browser wasn't supported)
  return (
    <React.Suspense
      fallback={<Splash animation={checkedForBrowserSupport && isAuthReload === false} isLoggedIn={isLoggedInRouter} />}
    >
      {(supported || ignoreUnsupported) && <NestedRouter isLoggedIn={isLoggedInRouter} />}
    </React.Suspense>
  )
}

export default RouterSelector
