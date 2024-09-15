import React, { useCallback, useContext, useMemo } from 'react'

import { identity } from 'lodash'
import Instructions from '../components/Instructions'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'
import logger from '../../../lib/logger/js-logger'
import { FVFlowContext } from '../standalone/context/FVFlowContext'

import useFaceTecSDK from '../hooks/useFaceTecSDK'
import useFaceTecVerification from '../hooks/useFaceTecVerification'
import useVerificationAttempts from '../hooks/useVerificationAttempts'
import useEnrollmentIdentifier from '../hooks/useEnrollmentIdentifier'
import { MAX_ATTEMPTS_ALLOWED } from '../sdk/FaceTecSDK.constants'

import {
  fireEvent,
  FV_GETREADY_ZOOM,
  FV_PROGRESS_ZOOM,
  FV_START,
  FV_SUCCESS_ZOOM,
  FV_TRYAGAIN_ZOOM,
  FV_ZOOMFAILED,
} from '../../../lib/analytics/analytics'

import { tryUntil } from '../../../lib/utils/async'
import useFVLoginInfoCheck from '../standalone/hooks/useFVLoginInfoCheck'
import AsyncStorage from '../../../lib/utils/asyncStorage'

const log = logger.child({ from: 'FaceVerification' })

const FaceVerification = ({ screenProps, navigation }) => {
  const { attemptsCount, trackAttempt, resetAttempts } = useVerificationAttempts()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const { isFVFlow } = useContext(FVFlowContext)
  const { faceIdentifier: enrollmentIdentifier, chainId, v1FaceIdentifier: fvSigner } = useEnrollmentIdentifier()

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
      // on FVFlow we dont verify whitelisting, that is on the developer using the fvflow to test back in their app
      let isCitizen = isFVFlow

      if (!isFVFlow) {
        try {
          isCitizen = await tryUntil(() => goodWallet.isCitizen(), identity, 5, 3000)
        } catch {
          isCitizen = false
        }
      }

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

      // 2. returning success to the caller
      fireEvent(FV_SUCCESS_ZOOM)
      AsyncStorage.removeItem('hasStartedFV')

      if (isFVFlow) {
        screenProps.navigateTo('FVFlowSuccess')
        return
      }

      if (userStorage?.userProperties) {
        userStorage.userProperties.set('fv2', true)
      }

      screenProps.navigateTo('Claim', { isValid: true })
    },
    [screenProps, resetAttempts, exceptionHandler, goodWallet, isFVFlow, userStorage],
  )

  // calculating retries allowed for FV session
  const maxRetries = useMemo(() => {
    const attemptsLeft = MAX_ATTEMPTS_ALLOWED - attemptsCount

    return Math.max(0, attemptsLeft - 1)
  }, [attemptsCount])

  // Using zoom verification hook, passing completion callback
  const startVerification = useFaceTecVerification({
    chainId,
    enrollmentIdentifier,
    fvSigner,
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
    if (!enrollmentIdentifier) {
      return
    }

    fireEvent(FV_START)
    startVerification()
  }, [startVerification, enrollmentIdentifier])

  // if fv flow and no account jwt won't be obtained,
  // isFVFLowReady will be false so SDK won't be initialized
  const [initialized] = useFaceTecSDK({
    onError: sdkExceptionHandler,
  })

  // does redirect to error page with if no account/faceid/other params specified
  // othwerise page will stuck on 'loading' "GOT IT" button
  useFVLoginInfoCheck(navigation)

  return <Instructions onDismiss={verifyFace} ready={initialized} />
}

export default FaceVerification
