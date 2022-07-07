import { useEffect } from 'react'
import { Linking } from 'react-native'
import VersionCheck from 'react-native-version-check'
import codePush from 'react-native-code-push' // eslint-disable-line import/default

import logger from '../../lib/logger/js-logger'
import Config from '../../config/config'
import useShowUpdateDialog from './UpdateDialog'

const { InstallMode } = codePush
const { suggestMobileAppUpdate, suggestCodePushUpdate, newVersionUrl, codePushDeploymentKey } = Config

const log = logger.child({ from: 'useUpdateDialog' })
const makeOpenURL = url => () => Linking.openURL(url)

export default () => {
  const updateDialogRef = useShowUpdateDialog()

  useEffect(() => {
    const checkVersion = async () => {
      const currentVersion = VersionCheck.getCurrentVersion()
      const packageName = await VersionCheck.getPackageName()

      const options = { packageName }
      const latestVersion = await VersionCheck.getLatestVersion(options)
      const storeUrl = await VersionCheck.getStoreUrl(options)

      log.debug('Versions', { packageName, currentVersion, latestVersion, storeUrl })

      const res = await VersionCheck.needUpdate({ currentVersion, latestVersion, depth: 3 })
      const { isNeeded } = res || {}

      log.debug('Response', res)

      if (isNeeded) {
        const [onUpdate, onOpenUrl] = [storeUrl, newVersionUrl].map(makeOpenURL)

        updateDialogRef.current(onUpdate, onOpenUrl)
      }

      return isNeeded
    }

    const checkForUpdates = async () => {
      let hasNewVersion = false

      if (suggestMobileAppUpdate) {
        hasNewVersion = await checkVersion().catch(e => {
          log.warn('Error checking new mobile app version', e.message, e)

          return false
        })
      }

      if (suggestCodePushUpdate && !hasNewVersion) {
        await codePush
          .sync({
            updateDialog: true,
            installMode: InstallMode.IMMEDIATE,
            deploymentKey: codePushDeploymentKey,
          })
          .catch(e => {
            log.warn('Hot code push sync error', e.message, e)
          })
      }
    }

    checkForUpdates()
  }, [])
}
