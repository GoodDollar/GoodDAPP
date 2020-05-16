import { useCallback, useEffect } from 'react'

import UserStorage from '../../../../lib/gundb/UserStorage'
import { useCurriedSetters } from '../../../../lib/undux/GDStore'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import logger from '../../../../lib/logger/pino-logger'
import useLoadingIndicator from '../../../../lib/hooks/useLoadingIndicator'
import useZoomSDK from '../hooks/useZoomSDK'
import useZoomVerification from '../hooks/useZoomVerification'

const log = logger.child({ from: 'FaceVerification' })
const FaceVerification = ({ screenProps }) => {
  const [setIsCitizen] = useCurriedSetters(['isLoggedInCitizen'])
  const [, hideLoading, toggleLoading] = useLoadingIndicator()

  // Redirects to the error screen, passing exception
  // object and allowing to show/hide retry button (hides it by default)
  const showErrorScreen = useCallback(
    (error, allowRetry = false) => {
      log.debug('FaceVerification error', { error })
      screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
    },
    [screenProps]
  )

  // ZoomSDK session completition handler
  const completionHandler = useCallback(
    async status => {
      log.debug('FaceVerification completed', { status })

      const isCitizen = await goodWallet.isCitizen()

      // if session was successfull - whitelistening user
      // and returning sucecss to the caller
      setIsCitizen(isCitizen)
      screenProps.pop({ isValid: true })
    },
    [screenProps, setIsCitizen]
  )

  // ZoomSDK session exception handler
  const exceptionHandler = useCallback(
    exception => {
      const { name } = exception

      if ('UserCancelled' === name) {
        // If user has cancelled face verification by own
        // decision - redirecting back to the into screen
        screenProps.navigateTo('FaceVerificationIntro')
        return
      }

      // handling error
      showErrorScreen(exception, true)
    },
    [screenProps, showErrorScreen]
  )

  // ZoomSDK initialization error handler
  const sdkExceptionHandler = useCallback(
    exception => {
      // handling error
      showErrorScreen(exception, false)
    },
    [showErrorScreen]
  )

  // Using zoom verification hook, passing completion callback
  const startVerification = useZoomVerification({
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),
    onComplete: completionHandler,
    onError: exceptionHandler,
  })

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  const isInitialized = useZoomSDK({
    onInitialized: startVerification,
    onError: sdkExceptionHandler,
  })

  useEffect(() => {
    toggleLoading(!isInitialized)
    return hideLoading
  }, [isInitialized])

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
