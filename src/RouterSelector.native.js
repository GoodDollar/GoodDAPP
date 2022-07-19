import React, { useContext, useMemo } from 'react'
import { first } from 'lodash'

import Splash, { animationDuration } from './components/splash/Splash'
import useUpdateDialog from './components/appUpdate/useUpdateDialog'
import { delay } from './lib/utils/async'
import { retryImport } from './lib/utils/system'
import { handleLinks } from './lib/utils/linking'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'

import Config from './config/config'
import logger from './lib/logger/js-logger'
import './lib/utils/debugUserAgent'
import { GlobalTogglesContext } from './lib/contexts/togglesContext'
import AsyncStorage from './lib/utils/asyncStorage'
import { OLD_NOTIFICATIONS } from './lib/constants/localStorage'

const log = logger.child({ from: 'RouterSelector' })

const initAnalyticsAndFireAppOpen = async (isLoggedIn = false) => {
  await initAnalytics()
  fireEvent(APP_OPEN, { platform: 'native', isLoggedIn })
}

log.debug({ Config })

let SignupRouter = React.lazy(() =>
  Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    initAnalyticsAndFireAppOpen().then(() => handleLinks(log)), // handleLinks depends on analytics
    delay(animationDuration),
  ]).then(first),
)

let AppRouter = React.lazy(() => {
  log.debug('initializing storage and wallet...')

  // always wait for full splash on native
  return Promise.all([
    retryImport(() => import(/* webpackChunkName: "router" */ './Router')),
    initAnalyticsAndFireAppOpen(),
    delay(animationDuration),
    AsyncStorage.setItem(OLD_NOTIFICATIONS, []),
  ])
    .then(first)
    .finally(() => {
      log.debug('router ready')
    })
})

const RouterSelector = () => {
  const { isLoggedInRouter } = useContext(GlobalTogglesContext)

  useUpdateDialog()

  const Router = useMemo(() => (isLoggedInRouter ? AppRouter : SignupRouter), [isLoggedInRouter])

  return (
    <React.Suspense fallback={<Splash animation />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
