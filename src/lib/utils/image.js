import { isPlainObject, isString } from 'lodash'
import { File } from './ipfs'

const dataUrlRegexp = /^data:(image\/(\w{3,5}));base64,/i
const extensionRegexp = /\.\w{3,5}$/i

const stripBase64 = dataURL => dataURL.substring(dataURL.indexOf(',') + 1)

const parseDataUrl = (base64, fileName = 'image') => {
  const [, mime, extension] = dataUrlRegexp.exec(base64)

  return {
    mime,
    filename: `${fileName}.${extension}`,
    base64: stripBase64(base64),
  }
}

export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600
export const DEFAULT_AVATAR_FILENAME = 'GD_AVATAR'

export * from './imageHelpers'

export const isImageRecord = source =>
  isPlainObject(source) && ['mime', 'filename', 'base64'].every(field => field in source)

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
export const asImageRecord = async (fileOrBase64, fileName = 'image') => {
  const file = fileOrBase64
  let dataURL = file

  if (isValidBase64Image(fileOrBase64)) {
    return parseDataUrl(dataURL, fileName)
  }

  if (!(file instanceof File)) {
    throw new Error('asImageRecord(): Invalid input, should be an data-url or File instance')
  }

  const { name, type } = file
  const reader = new FileReader()

  // using FileReader to read file as the data url asyncronously
  dataURL = await new Promise(resolve => {
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })

  // stripping data uri scheme and mime type to get the bare base64 string
  const base64 = stripBase64(dataURL)

  // returning ImageRecord
  return { filename: name, mime: type, base64 }
}

// converts image record to the file instance:
export const asFile = (imageRecordOrBase64, fileName = 'image') => {
  let imageRecord = imageRecordOrBase64
  const dataURL = imageRecord

  if (isValidBase64Image(dataURL)) {
    imageRecord = parseDataUrl(dataURL, fileName)
  } else if (!isImageRecord(imageRecord)) {
    throw new Error('asFile(): Invalid input, should be an data-url or image record')
  }

  const { mime, filename, base64 } = imageRecord
  const binary = atob(base64)
  let offset = binary.length
  const buffer = new Uint8Array(offset)

  while (offset--) {
    buffer[offset] = binary.charCodeAt(offset)
  }

  return new File([buffer], filename, { type: mime })
}

export const updateImageRecord = (imageRecord, data) => {
  const updatedRecord = { ...imageRecord, ...data }
  const { mime } = data

  if (mime) {
    const dotExtension = '.' + mime.replace('image/', '')
    const { filename } = imageRecord

    if (!filename.endsWith(dotExtension)) {
      updatedRecord.filename = filename.replace(extensionRegexp, dotExtension)
    }
  }

  return updatedRecord
}
