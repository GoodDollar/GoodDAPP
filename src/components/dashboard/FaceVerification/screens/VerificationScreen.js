import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Instructions from '../components/Instructions'

import UserStorage from '../../../../lib/gundb/UserStorage'
import { useCurriedSetters } from '../../../../lib/undux/GDStore'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import logger from '../../../../lib/logger/pino-logger'

import useLoadingIndicator from '../../../../lib/hooks/useLoadingIndicator'
import useFaceTecSDK from '../hooks/useFaceTecSDK'
import useFaceTecVerification from '../hooks/useFaceTecVerification'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

import { MAX_ATTEMPTS_ALLOWED } from '../sdk/FaceTecSDK.constants'

import random from '../utils/random'

import {
  fireEvent,
  FV_GETREADY_ZOOM,
  FV_INSTRUCTIONS,
  FV_PROGRESS_ZOOM,
  FV_SUCCESS_ZOOM,
  FV_TRYAGAIN_ZOOM,
  FV_ZOOMFAILED,
} from '../../../../lib/analytics/analytics'

const AB = random(0.5)

const log = logger.child({ from: 'FaceVerification' })

const FaceVerification = ({ screenProps }) => {
  const [showLoading, hideLoading] = useLoadingIndicator()
  const [showInstructions, setShowInstructions] = useState(false)
  const [setIsCitizen] = useCurriedSetters(['isLoggedInCitizen'])
  const { attemptsCount, trackAttempt, resetAttempts } = useVerificationAttempts()

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
    ({ reason, ...failureFlags }) => {
      const { message } = reason
      const eventData = {
        ...failureFlags,
        reason: message,
      }

      trackAttempt(reason)
      fireEvent(FV_TRYAGAIN_ZOOM, eventData)
    },
    [trackAttempt],
  )

  // FaceTecSDK session completions handler
  const completionHandler = useCallback(
    async status => {
      log.debug('FaceVerification completed', { status })

      const isCitizen = await goodWallet.isCitizen()

      // if session was successful
      // 1. resetting attempts
      resetAttempts()

      // 2. whitelisting user
      setIsCitizen(isCitizen)

      // 3. returning success to the caller
      screenProps.pop({ isValid: true })
      fireEvent(FV_SUCCESS_ZOOM)
    },
    [screenProps, setIsCitizen, resetAttempts],
  )

  // FaceTecSDK session exception handler
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

  // calculating retries allowed for FV session
  const maxRetries = useMemo(() => {
    const attemptsLeft = MAX_ATTEMPTS_ALLOWED - attemptsCount

    return Math.max(0, attemptsLeft - 1)
  }, [attemptsCount])

  // Using zoom verification hook, passing completion callback
  const startVerification = useFaceTecVerification({
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),
    onUIReady: uiReadyHandler,
    onCaptureDone: captureDoneHandler,
    onRetry: retryHandler,
    onComplete: completionHandler,
    onError: exceptionHandler,
    maxRetries,
  })

  // SDK initialized handler
  const sdkInitializedHandler = useCallback(() => {
    hideLoading()
    setShowInstructions(true)
    fireEvent(FV_INSTRUCTIONS, { ab: AB })
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
  // starting verification once sdk successfully initializes
  // on error redirecting to the error screen
  useFaceTecSDK({
    onInitialized: sdkInitializedHandler,
    onError: sdkExceptionHandler,
  })

  // showing loading indicator once component rendered
  // and initialization started, returning cancel hook
  // to make sure we'll hide the indicator once we'll
  // start navigating to another screen
  useEffect(() => {
    showLoading()
    return hideLoading
  }, [])

  return showInstructions ? <Instructions onDismiss={verifyFace} ab={AB} /> : null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
