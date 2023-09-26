import { useContext, useEffect } from 'react'
import { Linking } from 'react-native'
import VersionCheck from 'react-native-version-check'
import codePush from 'react-native-code-push' // eslint-disable-line import/default

import logger from '../../lib/logger/js-logger'
import Config from '../../config/config'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import useShowUpdateDialog from './UpdateDialog'

const { InstallMode } = codePush
const { suggestMobileAppUpdate, suggestCodePushUpdate, newVersionUrl, codePushDeploymentKey } = Config

const log = logger.child({ from: 'useUpdateDialog' })
const makeOpenURL = url => () => Linking.openURL(url)

export default () => {
  const updateDialogRef = useShowUpdateDialog()
  const { setHasSyncedCodePush } = useContext(GlobalTogglesContext)

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

      // statusCode = 0 - The app is up-to-date with the CodePush server.
      // statusCode = 2 The app had an optional update which the end user chose to ignore. (This is only applicable when the updateDialog is used)
      // statusCode = 1 - The update has been installed and will be run either immediately after the syncStatusChangedCallback function returns or the next time the app resumes/restarts, depending on the InstallMode specified in SyncOptions.
      // statusCode = 4 - There is an ongoing sync operation running which prevents the current call from being executed.

      if (suggestCodePushUpdate && !hasNewVersion) {
        await codePush
          .sync(
            {
              updateDialog: false,
              installMode: InstallMode.IMMEDIATE,
              deploymentKey: codePushDeploymentKey,
            },
            status => {
              setHasSyncedCodePush(status === 0)
            },
          )
          .catch(e => {
            log.warn('Hot code push sync error', e.message, e)
          })
      }
    }

    checkForUpdates()
  }, [])
}
