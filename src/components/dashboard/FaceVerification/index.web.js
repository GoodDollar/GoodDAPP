import { useCallback, useRef, useEffect, useMemo } from 'react'

import useZoomSDK from './hooks/useZoomSDK'
import useZoomVerification from './hooks/useZoomVerification'

const FaceVerification = ({ screenProps }) => {
  const screenPropsRef = useRef(null)

  const handlers = useMemo(() => {
    const exceptionHandler = (error, allowRetry = true) =>
      screenPropsRef.current.navigateTo(
        'FaceVerificationError', { error, allowRetry }
      )

    return {
      exception: exceptionHandler,
      sdkException: error => exceptionHandler(error, false),
      completion: isSuccess => {
        if (isSuccess) {
          screenProps.current.pop({ isValid: true })
        }
      }
    }
  }, [])

  const { startVerification } = useZoomVerification({
    onComplete: handlers.completion,
    onError: handlers.exception,
  })

  useZoomSDK({
    onInitialized: startVerification,
    onError: handlers.sdkException,
  })

  useEffect(
    () => screenPropsRef.current = screenProps,
    [screenProps]
  );

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
