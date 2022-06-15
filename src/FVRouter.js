import React, { useMemo } from 'react'
import { Portal } from 'react-native-paper'

import { createStackNavigator } from './components/appNavigation/stackNavigation'
import createAppContainer from './lib/utils/createAppContainer'
import { FVFlowContextProvider } from './lib/fvflow/FVFlow'
import { lazyScreens, withNavigationOptions } from './lib/utils/navigation'
import { FVFlowDone, FVFlowError } from './components/dashboard/FaceVerification/screens/FVFlowScreens'
import logger from './lib/logger/js-logger'

import Blurred from './components/common/view/Blurred'
import { Support } from './components/webView/webViewInstances'

const log = logger.child({ from: 'FVRouter' })

const [FaceVerification, FaceVerificationIntro, FaceVerificationError] = withNavigationOptions({
  navigationBarHidden: false,
  title: 'Face Verification',
})([
  ...lazyScreens(
    () => import('./components/dashboard/FaceVerification'),
    'FaceVerification',
    'FaceVerificationIntro',
    'FaceVerificationError',
  ),
  FVFlowError,
  FVFlowDone,
])

const generateRouter = () => {
  const initialRouteName = 'FaceVerificationIntro'

  const routes = {
    FaceVerificationIntro,
    FaceVerification,
    FaceVerificationError,
    FVFlowDone,
    FVFlowError,
    Support,
  }

  const router = createStackNavigator(routes, {})

  log.debug('Generated fv router', { initialRouteName })
  return createAppContainer(router)
}

const Router = () => {
  // const navigationStateHandler = useNavigationStateHandler()

  // will exec once during first render
  const RouterWrapper = useMemo(generateRouter, [])

  return (
    <>
      <FVFlowContextProvider>
        <Portal.Host>
          <Blurred whenDialog>
            <RouterWrapper />
          </Blurred>
        </Portal.Host>
      </FVFlowContextProvider>
    </>
  )
}

export default Router
