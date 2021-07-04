import React, { useCallback, useMemo } from 'react'

import Instructions from '../components/Instructions'

import UserStorage from '../../../../lib/userStorage/UserStorage'
import { useCurriedSetters } from '../../../../lib/undux/GDStore'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import logger from '../../../../lib/logger/pino-logger'

import useFaceTecSDK from '../hooks/useFaceTecSDK'
import useFaceTecVerification from '../hooks/useFaceTecVerification'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

import { MAX_ATTEMPTS_ALLOWED } from '../sdk/FaceTecSDK.constants'

import {
  fireEvent,
  FV_GETREADY_ZOOM,
  FV_PROGRESS_ZOOM,
  FV_START,
  FV_SUCCESS_ZOOM,
  FV_TRYAGAIN_ZOOM,
  FV_ZOOMFAILED,
} from '../../../../lib/analytics/analytics'

const log = logger.child({ from: 'FaceVerification' })

const FaceVerification = ({ screenProps }) => {
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
    // firing event
    fireEvent(FV_GETREADY_ZOOM)
  }, [])

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
    fireEvent(FV_START)
    startVerification()
  }, [startVerification])

  const [initialized] = useFaceTecSDK({
    onError: sdkExceptionHandler,
  })

  return <Instructions onDismiss={verifyFace} ready={initialized} />
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
