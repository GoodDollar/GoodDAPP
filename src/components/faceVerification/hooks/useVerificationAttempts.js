import { useCallback } from 'react'

import { MAX_ATTEMPTS_ALLOWED } from '../sdk/FaceTecSDK.constants'
import usePropsRefs from '../../../lib/hooks/usePropsRefs'

import { fireEvent, FV_TRYAGAINLATER } from '../../../lib/analytics/analytics'
import logger from '../../../lib/logger/js-logger'
import { hideRedBox } from '../utils/redBox'
import useVerificationContext from './useVerificationContext'

const log = logger.child({ from: 'useVerificationAttempts' })

export default () => {
  const { attemptsCount, attemptsHistory, reachedMaxAttempts, update, reset: resetAttempts } = useVerificationContext()
  const refs = usePropsRefs([attemptsCount, attemptsHistory, reachedMaxAttempts])

  const trackAttempt = useCallback(
    exception => {
      const { message } = exception
      const [getAttemptsCount, getAttemptsHistory] = refs
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
    [resetAttempts, update, refs],
  )

  // returns isReachedMaxAttempts flag, resets it once
  const isReachedMaxAttempts = useCallback(() => {
    const [, , getReachedMaxAttempts] = refs
    const reachedMaxAttempts = getReachedMaxAttempts()

    if (reachedMaxAttempts) {
      update({ reachedMaxAttempts: false })
    }

    return reachedMaxAttempts
  }, [update, refs])

  return {
    trackAttempt,
    resetAttempts,
    attemptsCount,
    attemptsHistory,
    isReachedMaxAttempts,
  }
}
