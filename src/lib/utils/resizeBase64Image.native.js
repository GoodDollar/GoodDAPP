import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'

export default async (base64, sizeByWidth) => {
  const { uri } = await ImageResizer.createResizedImage(base64, sizeByWidth, sizeByWidth, 'JPEG', 50)
  const resp = await RNFS.readFile(uri, 'base64')
  return `data:image/jpeg;base64,${resp}`
}
