import { Platform } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'

import { t } from '@lingui/macro'
import userStorage from '../../../lib/userStorage/UserStorage'

import { assembleDataUrl } from '../../../lib/utils/base64'
import { withTemporaryFile } from '../../../lib/utils/fs'

export default async ({ pickerOptions, showErrorDialog, avatar, log }) => {
  // eslint-disable-next-line require-await
  const crop = async path => ImagePicker.openCropper({ ...pickerOptions, path })

  // iOS supports reading from a base64 string, android does not.
  const { mime, data } = await Platform.select({
    // eslint-disable-next-line require-await
    android: async () => withTemporaryFile(avatar, async ({ uri }) => crop(uri)),
    // eslint-disable-next-line require-await
    default: async () => crop(avatar),
  })()

  const newAvatar = assembleDataUrl(data, mime)

  userStorage.setAvatar(newAvatar).catch(e => {
    showErrorDialog(t`Could not save image. Please try again.`)
    log.error('save image failed:', e.message, e)
  })
}
