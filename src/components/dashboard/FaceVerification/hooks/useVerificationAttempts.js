import { useCallback } from 'react'

import GDStore, { useCurriedSetters } from '../../../../lib/undux/GDStore'

export default () => {
  const store = GDStore.useStore()
  const attemptsCount = store.get('attemptsCount')
  const attemptsHistory = store.get('attemptsHistory')
  const [setAttemptsCount, setAttemptsHistory] = useCurriedSetters(['attemptsCount', 'attemptsHistory'])

  const trackAttempt = useCallback(
    exception => {
      setAttemptsCount(attemptsCount + 1)
      setAttemptsHistory([...attemptsHistory, exception])
    },
    [setAttemptsCount, attemptsCount, setAttemptsHistory, attemptsHistory],
  )

  const resetAttempts = useCallback(() => {
    setAttemptsCount(0)
    setAttemptsHistory([])
  }, [setAttemptsCount, setAttemptsHistory])

  return { attemptsCount, trackAttempt, resetAttempts, attemptsHistory }
}
