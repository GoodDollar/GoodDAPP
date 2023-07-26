// libraries
import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { assign, first, isBoolean, pick } from 'lodash'

// components

import Splash, { animationDuration, shouldAnimateSplash } from './components/splash/Splash'

// hooks
import useUpdateDialog from './components/appUpdate/useUpdateDialog'
import useBrowserSupport from './components/browserSupport/hooks/useBrowserSupport'
import UnsupportedBrowser from './components/browserSupport/components/UnsupportedBrowser'

// utils
import { delay } from './lib/utils/async'
import { retryImport } from './lib/utils/system'
import DeepLinking from './lib/utils/deepLinking'
import InternetConnection from './components/common/connectionDialog/internetConnection'
import isWebApp from './lib/utils/isWebApp'
import logger from './lib/logger/js-logger'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import { GlobalTogglesContext } from './lib/contexts/togglesContext'
import { handleLinks } from './lib/utils/linking'
import useServiceWorker from './lib/hooks/useServiceWorker'
import Config from './config/config'
import { isWebView } from './lib/utils/platform'
import AsyncStorage from './lib/utils/asyncStorage'
import { BROWSER_CHECKED } from './lib/constants/localStorage'

const { isDeltaApp } = Config
const log = logger.child({ from: 'RouterSelector' })

// identify the case user signup/in using torus redirect flow, so we want to load page asap
const isAuthReload = DeepLinking.pathname.startsWith('/Welcome/Auth')

const DisconnectedSplash = () => <Splash animation={false} />

let SignupRouter = React.lazy(() =>
  Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(log),
    delay(isAuthReload ? 0 : animationDuration),
  ]).then(first),
)

let AppRouter = React.lazy(async () => {
  const animateSplash = await shouldAnimateSplash(isAuthReload)

  log.debug('initializing storage and wallet...', { animateSplash })

  return Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    delay(animateSplash ? animationDuration : 0),
  ])
    .then(first)
    .finally(() => log.debug('router ready'))
})

const NestedRouter = memo(({ isLoggedIn }) => {
  useUpdateDialog()

  const Router = isLoggedIn ? AppRouter : SignupRouter

  return (
    <InternetConnection onDisconnect={DisconnectedSplash} isLoggedIn={isLoggedIn}>
      <Router />
    </InternetConnection>
  )
})

const RouterWrapper = () => {
  const initRef = useRef()

  const { isLoggedInRouter } = useContext(GlobalTogglesContext)

  // we use global state for signup process to signal user has registered
  const [ignoreUnsupported, setIgnoreUnsupported] = useState(false)
  const [checkedForBrowserSupport, setCheckedForBrowserSupport] = useState(false)

  let [supported, checkBrowser] = useBrowserSupport({
    checkOnMounted: false,
    unsupportedPopup: UnsupportedBrowser,
    onCheck: () => !isWebView,
  })

  useEffect(() => {
    const tags = { isLoggedIn: isLoggedInRouter }

    // send extra flag only at delta instance
    if (isDeltaApp) {
      assign(tags, { isDeltaApp })
    }

    if (isBoolean(isLoggedInRouter) && !initRef.current) {
      initAnalytics(tags).then(() => {
        let source, platform, params
        params = DeepLinking.params

        source = document.referrer.match(/^https:\/\/(www\.)?gooddollar\.org/) == null ? source : 'web3'
        source = Object.keys(pick(params, ['inviteCode', 'paymentCode', 'code'])).pop() || source
        platform = isWebApp ? 'webapp' : 'web'

        // only track potentialy new users
        if (!isLoggedInRouter) {
          fireEvent(APP_OPEN, { source, platform, isLoggedIn: isLoggedInRouter, params })
        }
        log.debug('Analytics Initialized RouterWrapper Rendered', { isLoggedInRouter, params, source, platform })
        initRef.current = true
      })
    }
  }, [isLoggedInRouter])

  useEffect(() => {
    const check = async () => {
      // once user is logged in check if their browser is supported and show warning if not
      const didCheck = await AsyncStorage.getItem(BROWSER_CHECKED)
      if (!didCheck && !isDeltaApp && isLoggedInRouter && supported === false) {
        checkBrowser()
        AsyncStorage.setItem(BROWSER_CHECKED, true)
      }

      setIgnoreUnsupported(true)
      setCheckedForBrowserSupport(true)
    }

    check()
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

const RouterSelector = () => {
  useServiceWorker()

  return <RouterWrapper />
}

export default RouterSelector
