import React, { useMemo } from 'react'
import { Portal } from 'react-native-paper'

import { createStackNavigator } from '../../appNavigation/stackNavigation'
import { withNavigationOptions } from '../../../lib/utils/navigation'
import { FaceVerification, FaceVerificationError, FaceVerificationIntro } from '..'
import logger from '../../../lib/logger/js-logger'

import { Support } from '../../webView/webViewInstances'
import Blurred from '../../common/view/Blurred'
import createAppContainer from '../../../lib/utils/createAppContainer'
import LoginFlowProvider from './context/LoginFlowContext'
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
      <LoginFlowProvider>
        <Portal.Host>
          <Blurred whenDialog>
            <RouterWrapper />
          </Blurred>
        </Portal.Host>
      </LoginFlowProvider>
    </>
  )
}

export default Router
