import React, { useCallback, useMemo } from 'react'

import { identity } from 'lodash'
import Instructions from '../components/Instructions'

import UserStorage from '../../../../lib/userStorage/UserStorage'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import logger from '../../../../lib/logger/js-logger'

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

import { tryUntil } from '../../../../lib/utils/async'
import useUserContext from '../../../../lib/hooks/useUserContext'

const log = logger.child({ from: 'FaceVerification' })

const FaceVerification = ({ screenProps }) => {
  const { update } = useUserContext()
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

  // FaceTecSDK session completions handler
  const completionHandler = useCallback(
    async status => {
      log.debug('FaceVerification completed', { status })

      // polling contracts for the whitelisted flag up to 30sec or until got true
      // fix: if still false, do not throw excetion, just return falsy status
      const isCitizen = await tryUntil(() => goodWallet.isCitizen(), identity, 5, 3000).catch(() => false)

      // if still non whitelisted - showing error screen
      if (!isCitizen) {
        const exception = new Error(
          `Face verification has been passed, but we encountered with issues` +
            `trying to allow claiming. Please try again a few minutes later`,
        )

        exception.name = 'UnableToWhitelist'
        exceptionHandler(exception)
        return
      }

      // if session was successful
      // 1. resetting attempts
      resetAttempts()

      // 2. whitelisting user
      update(isCitizen)

      // 3. returning success to the caller
      screenProps.pop({ isValid: true })
      fireEvent(FV_SUCCESS_ZOOM)
    },
    [screenProps, resetAttempts, exceptionHandler],
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
