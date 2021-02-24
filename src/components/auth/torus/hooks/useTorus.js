import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import useMountedState from '../../../../lib/hooks/useMountedState'
import createABTesting from '../../../../lib/hooks/useABTesting'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'AuthTorus' })

const { testPromise } = createABTesting('torusUxMode')

export default (onInitialized = noop) => {
  const [sdk, setSDK] = useState()
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const mountedState = useMountedState()

  useEffect(() => {
    testPromise.then(test => {
      log.debug('abTesting:', { test })
      setSDK(TorusSDK.factory({ torusUxMode: test && test.isCaseA ? 'popup' : 'redirect' }))
    })
  }, [])

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
