import React, { useCallback, useEffect, useState } from 'react'

import Instructions from '../components/Instructions'

import UserStorage from '../../../../lib/gundb/UserStorage'
import { useCurriedSetters } from '../../../../lib/undux/GDStore'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import logger from '../../../../lib/logger/pino-logger'

import useLoadingIndicator from '../../../../lib/hooks/useLoadingIndicator'
import useZoomSDK from '../hooks/useZoomSDK'
import useZoomVerification from '../hooks/useZoomVerification'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

import {
  fireEvent,
  FV_GETREADY_ZOOM,
  FV_INSTRUCTIONS,
  FV_PROGRESS_ZOOM,
  FV_SUCCESS_ZOOM,
  FV_TRYAGAIN_ZOOM,
  FV_ZOOMFAILED,
} from '../../../../lib/analytics/analytics'

const log = logger.child({ from: 'FaceVerification' })

const FaceVerification = ({ screenProps }) => {
  const [showLoading, hideLoading] = useLoadingIndicator()
  const [showInstructions, setShowInstructions] = useState(false)
  const [setIsCitizen] = useCurriedSetters(['isLoggedInCitizen'])
  const { trackAttempt, resetAttempts } = useVerificationAttempts()

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
      fireEvent(FV_TRYAGAIN_ZOOM, eventData)
      trackAttempt(eventData.reason)
    },
    [trackAttempt],
  )

  // ZoomSDK session completition handler
  const completionHandler = useCallback(
    async status => {
      log.debug('FaceVerification completed', { status })

      const isCitizen = await goodWallet.isCitizen()

      // if session was successfull
      // 1. resetting attempts
      resetAttempts()

      // 2. whitelistening user
      setIsCitizen(isCitizen)

      // 3. returning success to the caller
      screenProps.pop({ isValid: true })
      fireEvent(FV_SUCCESS_ZOOM)
    },
    [screenProps, setIsCitizen, resetAttempts],
  )

  // ZoomSDK session exception handler
  const exceptionHandler = useCallback(
    exception => {
      const { name } = exception
      const cancelled = 'UserCancelled'

      // 1. if not a user cancelled case - tracking attempt
      if (cancelled !== name) {
        trackAttempt(exception)
      }

      // 2. If user has cancelled face verification by own
      // decision - redirecting back to the into screen
      if ([cancelled, 'ForegroundLoosedError'].includes(name)) {
        screenProps.pop()
        return
      }

      // 2. handling error (showing corresponding error screen)
      showErrorScreen(exception)
    },
    [screenProps, showErrorScreen, trackAttempt],
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

  // SDK initialized handler
  const sdkInitializedHandler = useCallback(() => {
    hideLoading()
    setShowInstructions(true)
    fireEvent(FV_INSTRUCTIONS)
  }, [hideLoading, setShowInstructions])

  // SDK exception handler
  const sdkExceptionHandler = useCallback(
    exception => {
      fireEvent(FV_ZOOMFAILED)
      showErrorScreen(exception)
    },
    [showErrorScreen],
  )

  // "GOT IT" button handler
  const verifyFace = useCallback(() => {
    showLoading()
    setShowInstructions(false)
    startVerification()
  }, [showLoading, setShowInstructions, startVerification])

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  useZoomSDK({
    onInitialized: sdkInitializedHandler,
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

  return showInstructions ? <Instructions onDismiss={verifyFace} /> : null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
