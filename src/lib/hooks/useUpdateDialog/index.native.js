import React, { useEffect } from 'react'
import { Linking, StyleSheet } from 'react-native'
import VersionCheck from 'react-native-version-check'
import { useDialog } from '../../undux/utils/dialog'
import { RegularDialog } from '../../../components/common/dialogs/ServiceWorkerUpdatedDialog'
import { theme } from '../../../components/theme/styles'
import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'useUpdateDialog' })

export default () => {
  const [showDialog, hideDialog] = useDialog()

  const checkVersion = async () => {
    const currentVersion = VersionCheck.getCurrentVersion()
    const latestVersion = await VersionCheck.getLatestVersion()

    log.debug('Versions', { currentVersion, latestVersion })

    const res = await VersionCheck.needUpdate({ currentVersion, latestVersion, depth: 3 })

    if (!res) {
      return
    }

    if (res.isNeeded) {
      const onUpdate = () => {
        Linking.openURL(res.storeUrl)
      }

      showDialog({
        content: <RegularDialog />,
        buttonsContainerStyle: styles.serviceWorkerDialogButtonsContainer,
        buttons: [
          {
            text: 'Later',
            onPress: hideDialog,
            style: styles.laterButton,
          },
          { text: 'Update', onPress: onUpdate },
        ],
      })
    }
  }

  useEffect(() => {
    checkVersion()
  }, [])
}

const styles = StyleSheet.create({
  laterButton: {
    backgroundColor: '#CBCBCB',
  },
  serviceWorkerDialogButtonsContainer: {
    flexDirection: 'row',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.sizes.defaultDouble,
    justifyContent: 'space-between',
  },
})
