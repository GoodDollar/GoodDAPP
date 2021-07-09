import { Platform } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'

import base64ToFile from '../../../lib/utils/base64ToFile'
import { asDataUrl, asImageRecord, DEFAULT_AVATAR_FILENAME, updateImageRecord } from '../../../lib/utils/image'

export default async ({ pickerOptions, wrappedUserStorage, showErrorDialog, avatar, log }) => {
  // iOS supports reading from a base64 string, android does not.
  let path = avatar
  const imageRecord = await asImageRecord(path, DEFAULT_AVATAR_FILENAME) // TODO: image record should go here

  if (Platform.OS === 'android') {
    const { base64, filename } = imageRecord

    path = await base64ToFile(base64, filename)
  }

  const { mime, data } = await ImagePicker.openCropper({ ...pickerOptions, path })
  const updatedRecord = updateImageRecord(imageRecord, { mime, base64: data })
  const updatedAvatar = asDataUrl(updatedRecord)

  wrappedUserStorage.setAvatar(updatedAvatar).catch(e => {
    showErrorDialog('Could not save image. Please try again.')
    log.error('save image failed:', e.message, e)
  })
}
