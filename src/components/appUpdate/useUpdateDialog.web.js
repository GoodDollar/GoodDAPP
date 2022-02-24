import { useContext, useEffect } from 'react'

import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import useShowUpdateDialog from './UpdateDialog'
const log = logger.child({ from: 'useUpdateDialog' })

export default () => {
  const { serviceWorkerUpdated } = useContext(GlobalTogglesContext)
  const updateDialogRef = useShowUpdateDialog()

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
