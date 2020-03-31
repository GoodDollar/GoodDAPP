import { useCallback } from 'react'

import useZoomSDK from './hooks/useZoomSDK'
import useZoomVerification from './hooks/useZoomVerification'

const FaceVerification = ({ screenProps }) => {
  const completionHandler = useCallback(isSuccess => {
    if (isSuccess) {
      screenProps.pop({ isValid: true })
    }
  }, [screenProps])

  const exceptionHandler = useCallback((error, allowRetry = true) => {
    screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
  }, [screenProps])

  const sdkExceptionHandler = useCallback(error => {
    exceptionHandler(error, false)
  }, [exceptionHandler])

  const { startVerification } = useZoomVerification({
    onComplete: completionHandler,
    onError: exceptionHandler
  })

  useZoomSDK({
    onInitialized: startVerification,
    onError: sdkExceptionHandler
  })

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
