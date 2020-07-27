import { useCallback, useEffect, useRef } from 'react'

import UserStorage from '../../../../lib/gundb/UserStorage'
import { useCurriedSetters } from '../../../../lib/undux/GDStore'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import logger from '../../../../lib/logger/pino-logger'

import useLoadingIndicator from '../../../../lib/hooks/useLoadingIndicator'
import useZoomSDK from '../hooks/useZoomSDK'
import useZoomVerification from '../hooks/useZoomVerification'
import useVerificationAttempts, { MAX_RETRIES_ALLOWED } from '../hooks/useVerificationAttempts'

import {
  fireEvent,
  FV_GETREADY_ZOOM,
  FV_PROGRESS_ZOOM,
  FV_SUCCESS_ZOOM,
  FV_TRYAGAIN_ZOOM,
  FV_ZOOMFAILED,
} from '../../../../lib/analytics/analytics'

const log = logger.child({ from: 'FaceVerification' })

const FaceVerification = ({ screenProps }) => {
  const [showLoading, hideLoading] = useLoadingIndicator()
  const [setIsCitizen] = useCurriedSetters(['isLoggedInCitizen'])
  const { attemptsCount, trackAttempt, resetAttempts } = useVerificationAttempts()
  const livenessExceptionRef = useRef(null)

  // Redirects to the error screen, passing exception
  // object and allowing to show/hide retry button (hides it by default)
  const showErrorScreen = useCallback(
    error => {
      log.debug('FaceVerification error', { error })
      screenProps.navigateTo('FaceVerificationError', { error })
    },
    [screenProps],
  )

  const uiReadyHandler = useCallback(() => {
    // hiding loading indicator once Zoom UI is ready
    // this is needed for prevent Zoom's backdrop
    // to be overlapped with spinner's backdrop
    hideLoading()

    // firing event
    fireEvent(FV_GETREADY_ZOOM)
  }, [hideLoading])

  const captureDoneHandler = useCallback(() => {
    fireEvent(FV_PROGRESS_ZOOM)
  }, [])

  const retryHandler = useCallback(
    eventData => {
      const exception = eventData.reason

      // tracking all liveness exceptions except
      // the last one required to show 'try again lagter'
      if (attemptsCount < MAX_RETRIES_ALLOWED) {
        trackAttempt(exception)
      } else if (!livenessExceptionRef.current) {
        // storing the last one in the ref, it will be
        // tracked & reported by the error screen
        livenessExceptionRef.current = exception
      }

      fireEvent(FV_TRYAGAIN_ZOOM, eventData)
    },
    [attemptsCount],
  )

  // ZoomSDK session completition handler
  const completionHandler = useCallback(
    async status => {
      log.debug('FaceVerification completed', { status })

      const isCitizen = await goodWallet.isCitizen()

      // if session was successfull
      // resetting attempts
      resetAttempts()
      livenessExceptionRef.current = 0

      // whitelistening user
      setIsCitizen(isCitizen)

      // and returning sucecss to the caller
      screenProps.pop({ isValid: true })
      fireEvent(FV_SUCCESS_ZOOM)
    },
    [screenProps, setIsCitizen, resetAttempts],
  )

  // ZoomSDK session exception handler
  const exceptionHandler = useCallback(
    exception => {
      const { name } = exception
      const cancel = 'UserCancelled'
      const livenessException = livenessExceptionRef.current

      // if user cancelled session after failed liveness attempts
      // reached the threshold - showing the error screen with the
      // last one liveness exception to be tracked & repoted
      if (cancel === name && livenessException) {
        livenessExceptionRef.current = null
        showErrorScreen(livenessException)
        return
      }

      // If user has cancelled face verification by own
      // decision - redirecting back to the into screen
      if ([cancel, 'ForegroundLoosedError'].includes(name)) {
        screenProps.navigateTo('FaceVerificationIntro')
        return
      }

      // handling error
      showErrorScreen(exception)
    },
    [screenProps, showErrorScreen],
  )

  // Using zoom verification hook, passing completion callback
  const startVerification = useZoomVerification({
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),
    onUIReady: uiReadyHandler,
    onCaptureDone: captureDoneHandler,
    onRetry: retryHandler,
    onComplete: completionHandler,
    onError: exceptionHandler,
  })

  // SDK exception handler
  const sdkExceptionHandler = useCallback(
    exception => {
      fireEvent(FV_ZOOMFAILED)
      showErrorScreen(exception)
    },
    [showErrorScreen],
  )

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  useZoomSDK({
    onInitialized: startVerification,
    onError: sdkExceptionHandler,
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
