import React, { useEffect } from 'react'
import { Portal } from 'react-native-paper'
import { usePostHog } from 'posthog-react-native'

import { FaceVerification, FaceVerificationError, FaceVerificationIntro } from '..'
import logger from '../../../lib/logger/js-logger'
import { withNavigationOptions } from '../../../lib/utils/navigation'
import { createStackNavigator } from '../../appNavigation/stackNavigation'

import { initAnalytics, setPostHog } from '../../../lib/analytics/analytics'
import createAppContainer from '../../../lib/utils/createAppContainer'
import Blurred from '../../common/view/Blurred'
import Splash from '../../../components/splash/Splash'
import { VerificationContextProvider } from '../context/VerificationContext'
import NavBar from '../../appNavigation/NavBar'
import useFVRedirect from './hooks/useFVRedirect'
import FVFlowProvider from './context/FVFlowContext'
import { FVFlowError, FVFlowSuccess } from '.'

const log = logger.child({ from: 'FVRouter' })

const FVNavigationBar = () => {
  const fvRedirect = useFVRedirect()

  const goBack = () => {
    fvRedirect(false, 'Cancelled flow')
  }
  return <NavBar title="Face Verification" goBack={goBack} />
}

const FVFlowScreens = withNavigationOptions({
  navigationBarHidden: false,
  title: 'Face Verification',
  navigationBar: FVNavigationBar,
})({
  FaceVerificationIntro,
  FaceVerification,
  FaceVerificationError,
  FVFlowSuccess,
  FVFlowError,
})

// will exec once during first render
const RouterWrapper = React.lazy(async () => {
  const router = createStackNavigator(FVFlowScreens, {})
  const container = createAppContainer(router)

  log.debug('Generated fv router')

  await initAnalytics({ fvflow: true })
  return { default: container }
})

const Router = () => {
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog) {
      setPostHog(posthog)
    }
  }, [posthog])

  return (
    <>
      <FVFlowProvider>
        <Portal.Host>
          <Blurred whenDialog>
            <VerificationContextProvider>
              <React.Suspense fallback={<Splash />}>
                <RouterWrapper />
              </React.Suspense>
            </VerificationContextProvider>
          </Blurred>
        </Portal.Host>
      </FVFlowProvider>
    </>
  )
}

export default Router
