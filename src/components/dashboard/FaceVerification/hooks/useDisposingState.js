import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import api from '../api/FaceVerificationApi'
import logger from '../../../../lib/logger/pino-logger'
import useMountedState from '../../../../lib/hooks/useMountedState'

const log = logger.child({ from: 'useZoomVerification' })

export default ({ enrollmentIdentifier, onComplete = noop, onError = noop }) => {
  const mountedStateRef = useMountedState()

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

        log.debug('Got disposal state', { isDisposing, enrollmentIdentifier })
        onCompleteRef.current(isDisposing)

        if (mountedStateRef.current) {
          setDisposing(isDisposing)
        }
      } catch (exception) {
        const { message } = exception

        log.error('Error checking disposal state', message, exception)
        onErrorRef.current(exception)
      }
    }

    checkDisposalState()
  }, [])

  return disposing
}
