import ImagePicker from 'react-native-image-crop-picker'
import { Platform } from 'react-native'
import base64ToFile from '../../../lib/utils/base64ToFile'

export default async ({ pickerOptions, wrappedUserStorage, showErrorDialog, avatar, log }) => {
  // iOS supports reading from a base64 string, android does not.
  let imageToCrop = avatar

  if (Platform.OS === 'android') {
    const imageData = avatar.replace('data:image/jpeg;base64,', '')

    imageToCrop = await base64ToFile(imageData, 'GD_AVATAR.jpg')
  }

  const image = await ImagePicker.openCropper({ ...pickerOptions, path: imageToCrop })
  const newAvatar = `data:${image.mime};base64,${image.data}`

  wrappedUserStorage.setAvatar(newAvatar).catch(e => {
    showErrorDialog('Could not save image. Please try again.')
    log.error('save image failed:', e.message, e)
  })
}
