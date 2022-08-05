import { useCallback, useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import api from '../api/FaceVerificationApi'
import logger from '../../../lib/logger/js-logger'
import useMountedState from '../../../lib/hooks/useMountedState'

const log = logger.child({ from: 'useFaceTecVerification' })

export default ({ enrollmentIdentifier, requestOnMounted = true, onComplete = noop, onError = noop }) => {
  const [mountedState] = useMountedState()

  const [disposing, setDisposing] = useState(null)

  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)
  const setDisposingRef = useRef(setDisposing)

  const checkDisposalState = useCallback(async () => {
    log.debug('Starting to check disposal state', { enrollmentIdentifier })
    if (!enrollmentIdentifier) {
      return
    }

    try {
      const isDisposing = await api.isFaceSnapshotDisposing(enrollmentIdentifier)

      log.debug('Got disposal state', { isDisposing, enrollmentIdentifier })
      onCompleteRef.current(isDisposing)

      if (mountedState.current) {
        setDisposingRef.current(isDisposing)
      }
    } catch (exception) {
      const { message } = exception

      log.error('Error checking disposal state', message, exception)
      onErrorRef.current(exception)
    }
  }, [enrollmentIdentifier])

  useEffect(() => {
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onComplete, onError])

  useEffect(() => {
    if (requestOnMounted) {
      checkDisposalState()
    }
  }, [checkDisposalState, enrollmentIdentifier])

  return [disposing, checkDisposalState]
}
