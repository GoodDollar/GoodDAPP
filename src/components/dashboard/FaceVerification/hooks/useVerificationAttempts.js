import { useCallback } from 'react'
import { map } from 'lodash'

import GDStore, { useCurriedSetters } from '../../../../lib/undux/GDStore'
import Analytics from '../../../../lib/analytics/analytics'
import { FV_TRYAGAINLATER } from '../../../../lib/constants/analytics'
import logger from '../../../../lib/logger/pino-logger'

export const MAX_ATTEMPTS_ALLOWED = 3
const log = logger.child({ from: 'useVerificationAttempts' })
const { fireEvent } = Analytics

export default () => {
  const store = GDStore.useStore()
  const attemptsCount = store.get('attemptsCount') || 0
  const attemptsHistory = store.get('attemptsHistory') || []
  const reachedMaxAttempts = store.get('reachedMaxAttempts') || false

  const [setAttemptsCount, setAttemptsHistory, setReachedMaxAttempts] = useCurriedSetters([
    'attemptsCount',
    'attemptsHistory',
    'reachedMaxAttempts',
  ])

  const resetAttempts = useCallback(() => {
    setAttemptsCount(0)
    setAttemptsHistory([])
    setReachedMaxAttempts(false)
  }, [setAttemptsCount, setAttemptsHistory, setReachedMaxAttempts])

  const trackAttempt = useCallback(
    exception => {
      const { message } = exception

      // prepare updated count & history
      const updatedCount = attemptsCount + 1
      const updatedHistory = [...attemptsHistory, exception]

      // if we still not reached MAX_ATTEMPTS_ALLOWED - just add to the historu
      if (updatedCount < MAX_ATTEMPTS_ALLOWED) {
        setAttemptsCount(updatedCount)
        setAttemptsHistory(updatedHistory)
        return
      }

      // otherwise

      // 1. convert history to the array of messages
      const attemptsErrorMessages = map(updatedHistory, 'message')

      // 2. reset history in the store
      resetAttempts()

      // 3. log for debug purposes
      log.error(
        `FaceVerification still failing after ${MAX_ATTEMPTS_ALLOWED} attempts - FV_TRY_AGAIN_LATER fired:`,
        message,
        exception,
        { attemptsErrorMessages },
      )

      // 4. fire event and send error messages to the Amplitude
      fireEvent(FV_TRYAGAINLATER, { attemptsErrorMessages })

      // 5. set "reached max attempts" flag in the store
      setReachedMaxAttempts(true)
    },

    // resetAttempts already depends from setAttemptsCount, setAttemptsHistory & setReachedMaxAttempts
    [attemptsCount, attemptsHistory, resetAttempts],
  )

  // returns isReachedMaxAttempts flag, resets it once got
  const isReachedMaxAttempts = useCallback(() => {
    if (reachedMaxAttempts) {
      setReachedMaxAttempts(false)
    }

    return reachedMaxAttempts
  }, [reachedMaxAttempts, setReachedMaxAttempts])

  return {
    trackAttempt,
    resetAttempts,
    attemptsCount,
    attemptsHistory,
    isReachedMaxAttempts,
  }
}
