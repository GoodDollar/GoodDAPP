import { useCallback } from 'react'

import GDStore, { useCurriedSetters } from '../../../../lib/undux/GDStore'

export default () => {
  const store = GDStore.useStore()
  const verificationAttempts = store.get('verificationAttempts')
  const verificationAttemptErrMessages = store.get('verificationAttemptErrMessages')
  const [setVerificationAttempts, setVerificationAttemptErrMessages] = useCurriedSetters([
    'verificationAttempts',
    'verificationAttemptErrMessages',
  ])

  const trackNewAttempt = useCallback(
    errorMessage => {
      setVerificationAttempts(verificationAttempts + 1)
      setVerificationAttemptErrMessages([...verificationAttemptErrMessages, errorMessage])
    },
    [setVerificationAttempts, verificationAttempts, setVerificationAttemptErrMessages, verificationAttemptErrMessages],
  )

  const resetAttempts = useCallback(() => {
    setVerificationAttempts(0)
    setVerificationAttemptErrMessages([])
  }, [setVerificationAttempts, setVerificationAttemptErrMessages])

  return [verificationAttempts, trackNewAttempt, resetAttempts, verificationAttemptErrMessages]
}
