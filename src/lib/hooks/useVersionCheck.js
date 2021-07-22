import { useEffect } from 'react'
import { Linking, StyleSheet } from 'react-native'
import VersionCheck from 'react-native-version-check'
import { useDialog } from '../undux/utils/dialog'

export default () => {
  const [showDialog, hideDialog] = useDialog()

  const checkVersion = async () => {
    const currentVersion = VersionCheck.getCurrentVersion()
    const latestVersion = await VersionCheck.getLatestVersion()

    const res = await VersionCheck.needUpdate({ currentVersion, latestVersion, depth: 3 })

    if (res.isNeeded) {
      const onUpdate = () => {
        Linking.openURL(res.storeUrl)
      }

      showDialog({
        title: 'UPDATE AVAILABLE',
        message: 'There is a new version of the app available, please update for better experience',
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
})
