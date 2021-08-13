import RNFS from 'react-native-fs'

import uuid from './uuid'
import { parseDataUrl } from './base64'

export const withTemporaryFile = async (dataUrl, callback) => {
  const { mime, extension, base64 } = parseDataUrl(dataUrl)
  const filename = `${uuid()}.${extension}`
  const path = `${RNFS.CachesDirectoryPath}/${filename}`

  await RNFS.writeFile(path, base64, 'base64')

  try {
    const file = {
      uri: `file://${path}`,
      type: mime,
      name: filename,
    }

    return await callback(file)
  } finally {
    await RNFS.unlink(path)
  }
}
