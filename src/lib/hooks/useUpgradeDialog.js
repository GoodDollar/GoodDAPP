import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'

import Config from '../../config/config'

import ServiceWorkerUpdatedDialog from '../../components/common/dialogs/ServiceWorkerUpdatedDialog'

import SimpleStore from '../undux/SimpleStore'
import { useDialog } from '../undux/utils/dialog'

import normalize from '../utils/normalizeText'
import logger from '../logger/pino-logger'

import { theme } from '../../components/theme/styles'

const log = logger.child({ from: 'useUpgradeDialog' })

const styles = StyleSheet.create({
  serviceWorkerDialogButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.sizes.defaultDouble,
    justifyContent: 'space-between',
  },
  serviceWorkerDialogWhatsNew: {
    textAlign: 'left',
    fontSize: normalize(14),
  },
})

export default showPopup => {
  const [showDialog] = useDialog()
  const store = SimpleStore.useStore()
  const serviceWorkerUpdated = store.get('serviceWorkerUpdated')

  useEffect(() => {
    log.info('service worker updated', {
      serviceWorkerUpdated,
      showPopup,
    })

    if (!serviceWorkerUpdated || !showPopup) {
      return
    }

    showDialog({
      showCloseButtons: false,
      content: <ServiceWorkerUpdatedDialog />,
      buttonsContainerStyle: styles.serviceWorkerDialogButtonsContainer,
      buttons: [
        {
          text: 'WHAT’S NEW?',
          mode: 'text',
          color: theme.colors.gray80Percent,
          style: styles.serviceWorkerDialogWhatsNew,
          onPress: () => {
            window.open(Config.newVersionUrl, '_blank')
          },
        },
        {
          text: 'UPDATE',
          onPress: () => {
            const { waiting, active } = serviceWorkerUpdated || {}

            if (waiting && waiting.postMessage) {
              log.debug('service worker:', 'sending skip waiting', active.clients)

              waiting.postMessage({ type: 'SKIP_WAITING' })
            }
          },
        },
      ],
    })
  }, [serviceWorkerUpdated, showPopup])
}
