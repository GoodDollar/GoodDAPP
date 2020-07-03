import { useCallback } from 'react'

import GDStore, { useCurriedSetters } from '../../../../lib/undux/GDStore'

export default () => {
  const store = GDStore.useStore()
  const verificationAttempts = store.get('verificationAttempts')
  const [setVerificationAttempts] = useCurriedSetters(['verificationAttempts'])

  const trackNewAttempt = useCallback(() => setVerificationAttempts(verificationAttempts + 1), [
    setVerificationAttempts,
    verificationAttempts,
  ])

  const resetAttempts = useCallback(() => setVerificationAttempts(0), [setVerificationAttempts])

  return [verificationAttempts, trackNewAttempt, resetAttempts]
}
