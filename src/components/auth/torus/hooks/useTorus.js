import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'
import { isMobileNative } from '../../../../lib/utils/platform'

import useMountedState from '../../../../lib/hooks/useMountedState'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'AuthTorus' })

export default (onInitialized = noop) => {
  const sdk = useState(() => TorusSDK.factory({ uxMode: isMobileNative ? 'popup' : 'redirect' }))
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const mountedState = useMountedState()

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

    registerTorusWorker()
  }, [sdk])

  return [sdk, initialized]
}
