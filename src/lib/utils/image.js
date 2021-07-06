import { isString } from 'lodash'
import { File } from './ipfs'

export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600

export * from './imageHelpers'

export const isValidBase64Image = source =>
  isString(source) && source.startsWith('data:image/') && source.includes(';base64,')

export const isGoodDollarImage = source => source === -1

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

// reads File instance and converts it to the image record
export const asImageRecord = async file => {
  const { name, type } = file
  const reader = new FileReader()

  // using FileReader to read file as the data url asyncronously
  const dataURL = await new Promise(resolve => {
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })

  // stripping data uri scheme and mime type to get the bare base64 string
  const base64 = dataURL.substring(dataURL.indexOf(',') + 1)

  // returning ImageRecord
  return { filename: name, mime: type, base64 }
}

// converts image record to the file instance:
export const asFile = imageRecord => {
  const { mime, filename, base64 } = imageRecord
  const binary = atob(base64)
  let offset = binary.length
  const buffer = new Uint8Array(offset)

  while (offset--) {
    buffer[offset] = binary.charCodeAt(offset)
  }

  return new File([buffer], filename, { type: mime })
}
