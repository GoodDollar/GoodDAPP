import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import api from '../api/FaceVerificationApi'
import logger from '../../../../lib/logger/pino-logger'
import useMountedState from '../../../../lib/hooks/useMountedState'

const log = logger.child({ from: 'useZoomVerification' })

export default ({ enrollmentIdentifier, onComplete = noop, onError = noop }) => {
  const mountedStateRef = useMountedState()

  const [error, setError] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [disposing, setDisposing] = useState(null)

  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onComplete, onError])

  useEffect(() => {
    const checkDisposalState = async () => {
      log.debug('Starting to check disposal state', { enrollmentIdentifier })

      try {
        const isDisposing = await api.isFaceSnapshotDisposing(enrollmentIdentifier)

        onCompleteRef.current(isDisposing)
        log.debug('Got disposal state', { isDisposing, enrollmentIdentifier })

        if (mountedStateRef.current) {
          setDisposing(isDisposing)
          setCompleted(true)
        }
      } catch (exception) {
        const { message } = exception

        log.error('Error checking disposal state', message, exception)
        onErrorRef.current(exception)

        if (mountedStateRef.current) {
          setError(exception)
        }
      }
    }

    checkDisposalState()
  }, [])

  return [completed, disposing, error]
}
