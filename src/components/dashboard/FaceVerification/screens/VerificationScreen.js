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
  const [showLoading, hideLoading] = useLoadingIndicator()

  // Redirects to the error screen, passing exception
  // object and allowing to show/hide retry button (hides it by default)
  const showErrorScreen = useCallback(
    error => {
      log.debug('FaceVerification error', { error })
      screenProps.navigateTo('FaceVerificationError', { error })
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

      if (['UserCancelled', 'ForegroundLoosedError'].includes(name)) {
        // If user has cancelled face verification by own
        // decision - redirecting back to the into screen
        screenProps.navigateTo('FaceVerificationIntro')
        return
      }

      // handling error
      showErrorScreen(exception)
    },
    [screenProps, showErrorScreen]
  )

  // Using zoom verification hook, passing completion callback
  const startVerification = useZoomVerification({
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),

    // hiding loading indicator once Zoom UI is ready
    // this is needed for prevent Zoom's backdrop
    // to be overlapped with spinner's backdrop
    onUIReady: hideLoading,
    onComplete: completionHandler,
    onError: exceptionHandler,
  })

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  useZoomSDK({
    onInitialized: startVerification,
    onError: showErrorScreen,
  })

  // showing loading indicator once component rendered
  // and initialization started, returning cancel hook
  // to make sure we'll hide the indicator once we'll
  // start nativating to another screen
  useEffect(() => {
    showLoading()
    return hideLoading
  }, [])

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
