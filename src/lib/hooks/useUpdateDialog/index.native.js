import { useEffect } from 'react'
import { Linking } from 'react-native'
import VersionCheck from 'react-native-version-check'
import logger from '../../logger/pino-logger'
import useShowDialog from '../useShowDialog'
import Config from '../../../config/config'

const log = logger.child({ from: 'useUpdateDialog' })

export default () => {
  const [showUpdateDialog] = useShowDialog()

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

      const onOpenUrl = () => Linking.openURL(Config.newVersionUrl)

      showUpdateDialog(onUpdate, onOpenUrl)
    }
  }

  useEffect(() => {
    checkVersion()
  }, [])
}
