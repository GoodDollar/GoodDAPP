import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { once } from 'lodash'

import API from '../../lib/API/api'
import Config from '../../config/config'

import Text from '../../components/common/layout/SectionText'
import { NewReleaseDialog, RegularDialog } from '../../components/common/dialogs/ServiceWorkerUpdatedDialog'

import SimpleStore from '../undux/SimpleStore'
import { useDialog } from '../undux/utils/dialog'

import logger from '../logger/pino-logger'

import { theme } from '../../components/theme/styles'
import useOnPress from './useOnPress'

const log = logger.child({ from: 'useUpgradeDialog' })

// will be executed once, then cached with
// the promise returned on the first call
const isPhaseActual = once(async () => {
  const { phase } = Config
  const actualPhase = await API.getActualPhase()

  return phase === actualPhase
})

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
    justifyContent: 'center',
    cursor: 'pointer',
  },
})

const WhatsNewButtonComponent = () => {
  const handlePress = useOnPress(() => window.open(Config.newVersionUrl, '_blank'))

  return (
    <TouchableOpacity onPress={handlePress} style={styles.serviceWorkerDialogWhatsNew}>
      <Text fontSize={14} lineHeight={20} fontWeight="medium" color="gray80Percent">
        WHAT’S NEW?
      </Text>
    </TouchableOpacity>
  )
}

export default () => {
  const [showDialog] = useDialog()
  const store = SimpleStore.useStore()
  const serviceWorkerUpdated = store.get('serviceWorkerUpdated')

  useEffect(() => {
    log.info('service worker updated', {
      serviceWorkerUpdated,
    })

    if (!serviceWorkerUpdated) {
      return
    }

    isPhaseActual().then(isActual =>
      showDialog({
        showCloseButtons: false,
        content: isActual ? <RegularDialog /> : <NewReleaseDialog />,
        buttonsContainerStyle: styles.serviceWorkerDialogButtonsContainer,
        buttons: [
          {
            mode: 'custom',
            Component: WhatsNewButtonComponent,
          },
          {
            text: 'UPDATE',
            onPress: dismiss => {
              const { waiting, active } = serviceWorkerUpdated || {}

              if (waiting && waiting.postMessage) {
                log.debug('service worker:', 'sending skip waiting', active.clients)

                waiting.postMessage({ type: 'SKIP_WAITING' })
                dismiss() // close popup, sometimes service worker doesnt update immediatly
              } else {
                window.location.reload()
              }
            },
          },
        ],
      }),
    )
  }, [serviceWorkerUpdated])
}
