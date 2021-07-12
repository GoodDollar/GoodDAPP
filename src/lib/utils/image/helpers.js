const dataUrlRegexp = /^data:(image\/(\w{3,5}));base64,/i

export const AVATAR_SIZE = 320
export const SMALL_AVATAR_SIZE = 50
export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600
export const DEFAULT_AVATAR_FILENAME = 'GD_AVATAR'

export const stripBase64 = dataURL => dataURL.substring(dataURL.indexOf(',') + 1)

export const parseDataUrl = (base64, fileName = 'image') => {
  const [, mime, extension] = dataUrlRegexp.exec(base64)

  return {
    mime,
    filename: `${fileName}.${extension}`,
    base64: stripBase64(base64),
  }
}

export const mimeToExtension = (mime, options = null) => {
  const { withDot = false, uppercase = false } = options || {}
  const extension = mime.replace('image/', '')

  if (withDot) {
    return '.' + extension
  }

  if (uppercase) {
    return extension.toUpperCase()
  }

  return extension
}

// converts image record to the data-url string
// interface ImageRecord {
//   filename: string; // uploaded file name
//   mime: string;     // MIME-type of the image
//   base64: string;   // image data as base64 string
// }
export const asDataUrl = imageRecord => {
  const { mime, base64 } = imageRecord

  return `data:${mime};base64,` + base64
}
