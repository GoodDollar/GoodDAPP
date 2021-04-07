import { useEffect, useRef, useState } from 'react'
import { get, noop } from 'lodash'

import useMountedState from '../../../../lib/hooks/useMountedState'
import createABTesting from '../../../../lib/hooks/useABTesting'
import { DetectWebview, isMobileNative } from '../../../../lib/utils/platform'

import TorusSDK from '../sdk/TorusSDK'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'AuthTorus' })

const { useABTesting } = createABTesting('torusUxMode')

const skipInitializeABTesting = isMobileNative

export default (onInitialized = noop) => {
  const [sdk, setSDK] = useState()
  const [initialized, setInitialized] = useState(false)
  const onInitializedRef = useRef(onInitialized)
  const mountedState = useMountedState()

  // for native we need to skip initialize AB testing in this case
  const [, abVariant, abTestInitialized] = useABTesting(null, null, null, skipInitializeABTesting)

  useEffect(() => {
    if (abTestInitialized) {
      const webview = new DetectWebview(get(global, 'navigator.userAgent'))
      const isFacebookWebview = ['facebook', 'messenger'].includes(webview.browser)

      log.debug('abTesting:', { abVariant, isFacebookWebview, skipInitializeABTesting })

      // dont allow popup mode on facebook webview at all, since it doesnt work.
      // allow popup mode only for native.
      const torusUxMode = skipInitializeABTesting || (!isFacebookWebview && abVariant === 'A') ? 'popup' : 'redirect'

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
