import { useCallback } from 'react'

import useZoomSDK from './hooks/useZoomSDK'
import useZoomVerification from './hooks/useZoomVerification'

const FaceVerification = ({ screenProps }) => {
  const showErrorScreen = useCallback(
    (error, allowRetry = false) => {
      screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
    },
    [screenProps]
  )

  const completionHandler = useCallback(
    (isSuccess, _, lastMessage) => {
      if (isSuccess) {
        screenProps.navigateTo('Home')
        return
      }

      showErrorScreen(new Error(lastMessage), true)
    },
    [screenProps, showErrorScreen]
  )

  const { startVerification } = useZoomVerification({
    onComplete: completionHandler,
  })

  useZoomSDK({
    onInitialized: startVerification,
    onError: showErrorScreen,
  })

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
