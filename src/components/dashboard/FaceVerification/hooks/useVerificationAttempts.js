import { useCallback, useRef } from 'react'

import { map } from 'lodash'
import { MAX_ATTEMPTS_ALLOWED } from '../sdk/ZoomSDK.constants'

import GDStore, { defaultVerificationState, useCurriedSetters } from '../../../../lib/undux/GDStore'
import { fireEvent, FV_TRYAGAINLATER } from '../../../../lib/analytics/analytics'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'useVerificationAttempts' })

export default () => {
  const store = GDStore.useStore()
  const [setVerificationStateInStore] = useCurriedSetters(['verification'])
  const attemptsState = store.get('verification')
  const attemptsStateRef = useRef(attemptsState)
  const { attemptsCount, attemptsHistory } = attemptsState

  const updateAttemptsState = useCallback(
    stateVars => {
      const updatedState = {
        ...attemptsStateRef.current,
        ...stateVars,
      }

      attemptsStateRef.current = updatedState
      setVerificationStateInStore(updatedState)
    },
    [setVerificationStateInStore],
  )

  const resetAttempts = useCallback(() => updateAttemptsState(defaultVerificationState), [updateAttemptsState])

  const trackAttempt = useCallback(
    exception => {
      const { message } = exception
      const { attemptsCount, attemptsHistory } = attemptsStateRef.current

      // prepare updated count & history
      const updatedCount = attemptsCount + 1
      const updatedHistory = [...attemptsHistory, message]

      // if we still not reached MAX_ATTEMPTS_ALLOWED - just add to the historu
      if (updatedCount < MAX_ATTEMPTS_ALLOWED) {
        updateAttemptsState({
          attemptsCount: updatedCount,
          attemptsHistory: updatedHistory,
        })

        return
      }

      // otherwise

      // 1. get history to the error messages
      const attemptsErrorMessages = map(updatedHistory)

      // 2. reset history in the store
      resetAttempts()

      // 3. log for debug purposes
      log.error(
        `FaceVerification still failing after ${MAX_ATTEMPTS_ALLOWED} attempts - FV_TRY_AGAIN_LATER fired:`,
        message,
        exception,
        { attemptsErrorMessages },
      )

      // 3. fire event and send error messages to the Amplitude
      fireEvent(FV_TRYAGAINLATER, { attemptsErrorMessages })

      // 4. set "reached max attempts" flag in the store
      updateAttemptsState({ reachedMaxAttempts: true })
    },

    // resetAttempts already depends from updateAttemptsState
    [resetAttempts],
  )

  // returns isReachedMaxAttempts flag, resets it once
  const isReachedMaxAttempts = useCallback(() => {
    const { reachedMaxAttempts } = attemptsStateRef.current

    if (reachedMaxAttempts) {
      updateAttemptsState({ reachedMaxAttempts: true })
    }

    return reachedMaxAttempts
  }, [updateAttemptsState])

  return {
    trackAttempt,
    resetAttempts,
    attemptsCount,
    attemptsHistory,
    isReachedMaxAttempts,
  }
}
