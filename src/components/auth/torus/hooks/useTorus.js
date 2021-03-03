import { useEffect, useRef, useState } from 'react'
import { get, noop } from 'lodash'

import useMountedState from '../../../../lib/hooks/useMountedState'
import createABTesting from '../../../../lib/hooks/useABTesting'
import { DetectWebview } from '../../../../lib/utils/platform'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'AuthTorus' })

const { useABTesting } = createABTesting('torusUxMode')

export default (onInitialized = noop) => {
  const [sdk, setSDK] = useState()
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const mountedState = useMountedState()
  const [, abVariant, abTestInitialized] = useABTesting()

  useEffect(() => {
    if (abTestInitialized) {
      const webview = new DetectWebview(get(global, 'navigator.userAgent'))
      const isFacebookWebview = ['facebook', 'messenger'].includes(webview.browser)

      log.debug('abTesting:', { test, isFacebookWebview })

      //dont allow popup mode on facebook webview at all, since it doesnt work
      const torusUxMode = isFacebookWebview === false && abVariant === 'A' ? 'popup' : 'redirect'
      setSDK(TorusSDK.factory({ uxMode: torusUxMode }))
    }
  }, [abTestInitialized])

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
