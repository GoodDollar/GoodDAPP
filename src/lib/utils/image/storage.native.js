import RNFS from 'react-native-fs'

import { DEFAULT_AVATAR_FILENAME } from './helpers'

export const storeBase64Image = async (base64, fileName = DEFAULT_AVATAR_FILENAME) => {
  const path = `${RNFS.CachesDirectoryPath}/${fileName}`

  await RNFS.writeFile(path, base64, 'base64')
  return 'file://' + path
}
