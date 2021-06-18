import ImagePicker from 'react-native-image-crop-picker'
import { Platform } from 'react-native'
import base64ToFile from '../../../lib/utils/base64ToFile'

const base64Re = /^data:image\/(\w{3,5});base64,/i

export default async ({ pickerOptions, wrappedUserStorage, showErrorDialog, avatar, log }) => {
  // iOS supports reading from a base64 string, android does not.
  let imageToCrop = avatar

  if (Platform.OS === 'android') {
    const [, imageMime] = base64Re.exec(avatar) || []
    const imageData = avatar.replace(base64Re, '')

    imageToCrop = await base64ToFile(imageData, `GD_AVATAR.${imageMime}`)
  }

  const image = await ImagePicker.openCropper({ ...pickerOptions, path: imageToCrop })
  const newAvatar = `data:${image.mime};base64,${image.data}`

  wrappedUserStorage.setAvatar(newAvatar).catch(e => {
    showErrorDialog('Could not save image. Please try again.')
    log.error('save image failed:', e.message, e)
  })
}
