import { useEffect } from 'react'

import SimpleStore from '../../lib/undux/SimpleStore'

import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'
import useShowUpdateDialog from './UpdateDialog'

const log = logger.child({ from: 'useUpdateDialog' })

export default () => {
  const updateDialogRef = useShowUpdateDialog()
  const store = SimpleStore.useStore()
  const serviceWorkerUpdated = store.get('serviceWorkerUpdated')

  useEffect(() => {
    log.info('service worker updated', {
      serviceWorkerUpdated,
    })

    if (!serviceWorkerUpdated) {
      return
    }

    const onUpdate = dismiss => {
      const { waiting, active } = serviceWorkerUpdated || {}

      if (!waiting || !waiting.postMessage) {
        window.location.reload()
        return
      }

      log.debug('service worker:', 'sending skip waiting', active.clients)

      waiting.postMessage({ type: 'SKIP_WAITING' })
      dismiss() // close popup, sometimes service worker doesnt update immediatly
    }

    const onOpenUrl = () => window.open(Config.newVersionUrl, '_blank')

    updateDialogRef.current(onUpdate, onOpenUrl)
  }, [serviceWorkerUpdated])
}
