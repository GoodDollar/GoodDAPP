import React from 'react'
import { Portal } from 'react-native-paper'

import { FaceVerification, FaceVerificationError, FaceVerificationIntro } from '..'
import logger from '../../../lib/logger/js-logger'
import { withNavigationOptions } from '../../../lib/utils/navigation'
import { createStackNavigator } from '../../appNavigation/stackNavigation'

import { initAnalytics } from '../../../lib/analytics/analytics'
import createAppContainer from '../../../lib/utils/createAppContainer'
import Blurred from '../../common/view/Blurred'
import { Support } from '../../webView/webViewInstances'
import Splash from '../../../components/splash/Splash'
import { VerificationContextProvider } from '../context/VerificationContext'
import FVFlowProvider from './context/FVFlowContext'
import { FVFlowError, FVFlowSuccess } from '.'

const log = logger.child({ from: 'FVRouter' })

const FVFlowScreens = withNavigationOptions({
  navigationBarHidden: false,
  title: 'Face Verification',
})({
  FaceVerificationIntro,
  FaceVerification,
  FaceVerificationError,
  FVFlowSuccess,
  FVFlowError,
})

// will exec once during first render
const RouterWrapper = React.lazy(async () => {
  const routes = {
    ...FVFlowScreens,
    Support,
  }

  const router = createStackNavigator(routes, {})
  const container = createAppContainer(router)

  log.debug('Generated fv router')

  await initAnalytics({ fvflow: true })
  return { default: container }
})

const Router = () => (
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

export default Router
