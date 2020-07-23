import React, { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'

import API from '../../lib/API/api'
import Config from '../../config/config'

import { NewReleaseDialog, RegularDialog } from '../../components/common/dialogs/ServiceWorkerUpdatedDialog'

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
    marginLeft: 0,
  },
})

export default () => {
  const [showDialog] = useDialog()
  const store = SimpleStore.useStore()
  const serviceWorkerUpdated = store.get('serviceWorkerUpdated')
  const actualPhaseRef = useRef(null)

  useEffect(() => {
    actualPhaseRef.current = API.getActualPhase()
  }, [])

  useEffect(() => {
    const { phase } = Config

    log.info('service worker updated', {
      serviceWorkerUpdated,
    })

    if (!serviceWorkerUpdated) {
      return
    }

    actualPhaseRef.current.then(actualPhase =>
      showDialog({
        showCloseButtons: false,
        content: phase === actualPhase ? <RegularDialog /> : <NewReleaseDialog />,
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
      }),
    )
  }, [serviceWorkerUpdated])
}
