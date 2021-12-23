import { useEffect } from 'react'
import { Linking } from 'react-native'
import VersionCheck from 'react-native-version-check'

import logger from '../../lib/logger/js-logger'
import Config from '../../config/config'
import useShowUpdateDialog from './UpdateDialog'

const log = logger.child({ from: 'useUpdateDialog' })

export default () => {
  const updateDialogRef = useShowUpdateDialog()

  useEffect(() => {
    const checkVersion = async () => {
      const currentVersion = VersionCheck.getCurrentVersion()
      const latestVersion = await VersionCheck.getLatestVersion()
      const packageName = await VersionCheck.getPackageName()
      const storeUrl = await VersionCheck.getStoreUrl({ packageName: packageName })

      log.debug('Versions', { currentVersion, latestVersion, storeUrl, packageName })

      const res = await VersionCheck.needUpdate({ currentVersion, latestVersion, depth: 3 })

      log.debug('Response', res)

      if (!res || !res.isNeeded) {
        return
      }

      const [onUpdate, onOpenUrl] = [storeUrl, Config.newVersionUrl].map(url => () => Linking.openURL(url))

      updateDialogRef.current(onUpdate, onOpenUrl)
    }

    checkVersion()
  }, [])
}
