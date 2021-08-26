import { useEffect } from 'react'
import Config from '../../../config/config'
import SimpleStore from '../../undux/SimpleStore'
import logger from '../../logger/pino-logger'
import useShowDialog from '../useShowDialog'

const log = logger.child({ from: 'useUpdateDialog' })

export default () => {
  const [showUpdateDialog] = useShowDialog()
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

      if (waiting && waiting.postMessage) {
        log.debug('service worker:', 'sending skip waiting', active.clients)

        waiting.postMessage({ type: 'SKIP_WAITING' })
        dismiss() // close popup, sometimes service worker doesnt update immediatly
      } else {
        window.location.reload()
      }
    }

    const onOpenUrl = () => window.open(Config.newVersionUrl, '_blank')

    showUpdateDialog(onUpdate, onOpenUrl)
  }, [serviceWorkerUpdated])
}
