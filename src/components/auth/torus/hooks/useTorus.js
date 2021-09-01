import { useCallback, useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import useMountedState from '../../../../lib/hooks/useMountedState'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/js-logger'
import useSDKOptions from './useSDKOptions'

const log = logger.get('AuthTorus')

export default (onInitialized = noop) => {
  const [sdk, setSDK] = useState()
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const mountedState = useMountedState()

  const applySDKOptions = useCallback(options => setSDK(TorusSDK.factory(options)), [setSDK])

  useSDKOptions(applySDKOptions)

  useEffect(() => {
    onInitializedRef.current = onInitialized
  }, [onInitialized])

  useEffect(() => {
    const registerTorusWorker = async () => {
      try {
        const result = await sdk.initialize()

        log.debug('torus service initialized', { result, sdk })

        onInitializedRef.current()

        if (mountedState.current) {
          setInitialized(true)
        }
      } catch (exception) {
        const { message } = exception

        log.error('failed initializing torus', message, exception)
      }
    }

    if (sdk) {
      registerTorusWorker()
    }
  }, [sdk])

  return [sdk, initialized]
}
