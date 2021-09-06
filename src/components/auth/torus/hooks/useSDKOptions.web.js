import { useEffect } from 'react'
import { get, noop } from 'lodash'

import createABTesting from '../../../../lib/hooks/useABTesting'
import { DetectWebview } from '../../../../lib/utils/platform'

import logger from '../../../../lib/logger/js-logger'

const { useABTesting } = createABTesting('torusUxMode')
const log = logger.child({ from: 'AuthTorus' })

export default (onOptions = noop) => {
  const [, abVariant, abTestInitialized] = useABTesting()

  useEffect(() => {
    if (!abTestInitialized) {
      return
    }

    const webview = new DetectWebview(get(global, 'navigator.userAgent'))
    const isFacebookWebview = ['facebook', 'messenger'].includes(webview.browser)
    const torusUxMode = isFacebookWebview === false && abVariant === 'A' ? 'popup' : 'redirect'

    log.debug('abTesting:', { abVariant, isFacebookWebview, torusUxMode })

    onOptions({ uxMode: torusUxMode })
  }, [abTestInitialized])
}
