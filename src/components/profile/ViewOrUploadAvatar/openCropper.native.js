import { Platform } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'

import { storeBase64Image } from '../../../lib/utils/image/storage'
import { updateImageRecord } from '../../../lib/utils/image'

export default async ({ pickerOptions, wrappedUserStorage, showErrorDialog, avatar, log }) => {
  const { base64, filename } = avatar
  let path = base64

  // iOS supports reading from a base64 string, android does not.
  if (Platform.OS === 'android') {
    path = await storeBase64Image(base64, filename)
  }

  const { mime, data } = await ImagePicker.openCropper({ ...pickerOptions, path })
  const updatedAvatar = updateImageRecord(avatar, { mime, base64: data })

  wrappedUserStorage.setAvatar(updatedAvatar).catch(e => {
    showErrorDialog('Could not save image. Please try again.')
    log.error('save image failed:', e.message, e)
  })
}
