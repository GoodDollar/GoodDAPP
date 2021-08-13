import { decode as atob } from 'base-64'

import uuid from './uuid'
import { parseDataUrl } from './base64'

// eslint-disable-next-line require-await
export const withTemporaryFile = async (dataUrl, callback) => {
  const { mime, extension, base64 } = parseDataUrl(dataUrl)
  const filename = `${uuid()}.${extension}`

  const binary = atob(base64)
  let offset = binary.length
  const buffer = new Uint8Array(offset)

  while (offset--) {
    buffer[offset] = binary.charCodeAt(offset)
  }

  return callback(new File([buffer], filename, { type: mime }))
}
