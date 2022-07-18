import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'
import { isMobileNative } from '../../../../lib/utils/platform'

import useMountedState from '../../../../lib/hooks/useMountedState'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'AuthTorus' })

export default (onInitialized = noop) => {
  const [sdk, setSDK] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const [mountedState] = useMountedState()

  useEffect(() => {
    onInitializedRef.current = onInitialized
  }, [onInitialized])

  useEffect(() => {
    const sdk = TorusSDK.factory({ uxMode: isMobileNative ? 'popup' : 'redirect' })

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

    setSDK(sdk)
    registerTorusWorker()
  }, [setSDK])

  return [sdk, initialized]
}
