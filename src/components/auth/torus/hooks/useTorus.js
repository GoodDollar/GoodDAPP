import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'
import { isMobileNative } from '../../../../lib/utils/platform'

import useMountedState from '../../../../lib/hooks/useMountedState'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'AuthTorus' })

export default (onInitialized = noop) => {
  const sdkRef = useRef(null)
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const mountedState = useMountedState()

  // inline functions outside effects are allowed if we're accessing refs only
  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  ;(() => {
    if (sdkRef.current) {
      return
    }

    sdkRef.current = TorusSDK.factory({ uxMode: isMobileNative ? 'popup' : 'redirect' })
  })()

  useEffect(() => {
    onInitializedRef.current = onInitialized
  }, [onInitialized])

  useEffect(() => {
    const { current: sdk } = sdkRef

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
  }, [])

  return [sdkRef.current, initialized]
}
