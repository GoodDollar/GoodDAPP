import React, { useContext, useEffect, useMemo } from 'react'
import { Portal } from 'react-native-paper'

import { createStackNavigator } from '../../appNavigation/stackNavigation'
import { withNavigationOptions } from '../../../lib/utils/navigation'
import { FaceVerification, FaceVerificationError, FaceVerificationIntro } from '..'
import logger from '../../../lib/logger/js-logger'

import { Support } from '../../webView/webViewInstances'
import Blurred from '../../common/view/Blurred'
import createAppContainer from '../../../lib/utils/createAppContainer'
import { GoodWalletContext } from '../../../lib/wallet/GoodWalletProvider'
import FVFlowProvider from './context/FVFlowContext'
import { FVFlowError, FVFlowSuccess } from '.'

const log = logger.child({ from: 'FVRouter' })

const LoginFlowScreens = withNavigationOptions({
  navigationBarHidden: false,
  title: 'Face Verification',
})({
  FaceVerification,
  FaceVerificationIntro,
  FaceVerificationError,
  FVFlowSuccess,
  FVFlowError,
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
  // will exec once during first render
  const RouterWrapper = useMemo(generateRouter, [])
  const { initWalletAndStorage } = useContext(GoodWalletContext)

  useEffect(() => {
    initWalletAndStorage(undefined, 'SEED')
  }, [])

  return (
    <>
      <FVFlowProvider>
        <Portal.Host>
          <Blurred whenDialog>
            <RouterWrapper />
          </Blurred>
        </Portal.Host>
      </FVFlowProvider>
    </>
  )
}

export default Router
