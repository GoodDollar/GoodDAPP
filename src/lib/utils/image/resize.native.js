import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'

import { asDataUrl, mimeToExtension, parseDataUrl } from './helpers'

export const resizeImage = async (imageSource, size) => {
  const { mime } = parseDataUrl(imageSource)
  const format = mimeToExtension(mime, { uppercase: true })
  const { uri } = await ImageResizer.createResizedImage(imageSource, size, size, format, 80)
  const base64 = await RNFS.readFile(uri, 'base64')

  return asDataUrl({ mime, base64 })
}
