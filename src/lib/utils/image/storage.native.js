import RNFS from 'react-native-fs'

export const storeBase64Image = async (base64, fileName = 'GD_FILE') => {
  const path = `${RNFS.CachesDirectoryPath}/${fileName}`

  await RNFS.writeFile(path, base64, 'base64')
  return 'file://' + path
}
