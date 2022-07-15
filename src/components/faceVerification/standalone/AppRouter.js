import React, { useMemo } from 'react'
import { Portal } from 'react-native-paper'

import { createStackNavigator } from '../../appNavigation/stackNavigation'
import { FVFlowContextProvider } from '../../../lib/fvflow/FVFlow'
import { lazyScreens, withNavigationOptions } from '../../../lib/utils/navigation'
import { FaceVerification, FaceVerificationError, FaceVerificationIntro } from '..'
import logger from '../../../lib/logger/js-logger'

import { Support } from '../../webView/webViewInstances'
import Blurred from './components/common/view/Blurred'
import createAppContainer from './lib/utils/createAppContainer'
import { LoginErrorScreen, LoginSuccessScreen } from '.'

const log = logger.child({ from: 'FVRouter' })

const LoginFlowScreens = withNavigationOptions({
  navigationBarHidden: false,
  title: 'Face Verification',
})({
  FaceVerification,
  FaceVerificationIntro,
  FaceVerificationError,
  LoginSuccessScreen,
  LoginErrorScreen,
})

const generateRouter = () => {
  const initialRouteName = 'FaceVerificationIntro'

  const routes = {
    ...LoginFlowScreens,
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
