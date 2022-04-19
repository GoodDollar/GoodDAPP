import { useCallback } from 'react'

import { MAX_ATTEMPTS_ALLOWED } from '../sdk/FaceTecSDK.constants'
import { defaultVerificationState, useFVContext } from '../../../../lib/contexts/fvContext'
import useRealtimeProps from '../../../../lib/hooks/useRealtimeProps'

import { fireEvent, FV_TRYAGAINLATER } from '../../../../lib/analytics/analytics'
import logger from '../../../../lib/logger/js-logger'
import { hideRedBox } from '../utils/redBox'

const log = logger.child({ from: 'useVerificationAttempts' })

export default () => {
  const { attemptsCount, attemptsHistory, reachedMaxAttempts, update } = useFVContext()
  const accessors = useRealtimeProps([attemptsCount, attemptsHistory, reachedMaxAttempts])
  const resetAttempts = useCallback(() => update(defaultVerificationState), [update])

  const trackAttempt = useCallback(
    exception => {
      const { message } = exception
      const [getAttemptsCount, getAttemptsHistory] = accessors
      const getUpdatedHistory = (history = null) => [...(history || getAttemptsHistory()), message]

      if (getAttemptsCount() < MAX_ATTEMPTS_ALLOWED - 1) {
        // if we still not reached MAX_ATTEMPTS_ALLOWED - just add to the history
        update(({ attemptsCount, attemptsHistory }) => ({
          // update count & history
          attemptsCount: attemptsCount + 1,
          attemptsHistory: getUpdatedHistory(attemptsHistory),
        }))

        return
      }

      // otherwise

      // 1. get history to the error messages
      const attemptsErrorMessages = getUpdatedHistory()

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
      update({ reachedMaxAttempts: true })
    },

    // resetAttempts already depends from updateAttemptsState
    [resetAttempts, update, accessors],
  )

  // returns isReachedMaxAttempts flag, resets it once
  const isReachedMaxAttempts = useCallback(() => {
    const [, , getReachedMaxAttempts] = accessors
    const reachedMaxAttempts = getReachedMaxAttempts()

    if (reachedMaxAttempts) {
      update({ reachedMaxAttempts: false })
    }

    return reachedMaxAttempts
  }, [update, accessors])

  return {
    trackAttempt,
    resetAttempts,
    attemptsCount,
    attemptsHistory,
    isReachedMaxAttempts,
  }
}
