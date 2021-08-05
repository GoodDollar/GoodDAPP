import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'

import { assembleDataUrl, parseDataUrl } from '../base64'

export const resizeImage = async (imageSource, size) => {
  const { mime, extension } = parseDataUrl(imageSource)
  const format = extension.toUpperCase()

  const { uri, path } = await ImageResizer.createResizedImage(imageSource, size, size, format, 80)

  try {
    const base64 = await RNFS.readFile(uri, 'base64')

    return assembleDataUrl(base64, mime)
  } finally {
    await RNFS.unlink(path)
  }
}
