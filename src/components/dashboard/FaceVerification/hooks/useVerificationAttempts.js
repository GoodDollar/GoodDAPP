import { useCallback } from 'react'

import { map } from 'lodash'
import { MAX_ATTEMPTS_ALLOWED } from '../sdk/FaceTecSDK.constants'

import useRealtimeStoreState from '../../../../lib/hooks/useRealtimeStoreState'

import GDStore, { defaultVerificationState } from '../../../../lib/undux/GDStore'
import { fireEvent, FV_TRYAGAINLATER } from '../../../../lib/analytics/analytics'
import logger from '../../../../lib/logger/js-logger'
import { hideRedBox } from '../utils/kindOfTheIssue'

const log = logger.get('useVerificationAttempts')

export default () => {
  const store = GDStore.useStore()
  const [getAttemptsState, updateAttemptsState, attemptsState] = useRealtimeStoreState(store, 'verification')
  const resetAttempts = useCallback(() => updateAttemptsState(defaultVerificationState), [updateAttemptsState])
  const { attemptsCount, attemptsHistory } = attemptsState

  const trackAttempt = useCallback(
    exception => {
      const { message } = exception
      const { attemptsCount, attemptsHistory } = getAttemptsState()

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
      hideRedBox(() =>
        log.error(
          `FaceVerification still failing after ${MAX_ATTEMPTS_ALLOWED} attempts - FV_TRY_AGAIN_LATER fired:`,
          message,
          exception,
          { attemptsErrorMessages },
        ),
      )

      // 3. fire event and send error messages to the Amplitude
      fireEvent(FV_TRYAGAINLATER, { attemptsErrorMessages })

      // 4. set "reached max attempts" flag in the store
      updateAttemptsState('reachedMaxAttempts', true)
    },

    // resetAttempts already depends from updateAttemptsState
    [resetAttempts, getAttemptsState],
  )

  // returns isReachedMaxAttempts flag, resets it once
  const isReachedMaxAttempts = useCallback(() => {
    const { reachedMaxAttempts } = getAttemptsState()

    if (reachedMaxAttempts) {
      updateAttemptsState('reachedMaxAttempts', false)
    }

    return reachedMaxAttempts
  }, [updateAttemptsState, getAttemptsState])

  return {
    trackAttempt,
    resetAttempts,
    attemptsCount,
    attemptsHistory,
    isReachedMaxAttempts,
  }
}
