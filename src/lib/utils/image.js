import { isPlainObject, isString, omit } from 'lodash'

import { File } from './ipfs'
import { resizeImage } from './image/resize'
import { asDataUrl, mimeToExtension, parseDataUrl, stripBase64 } from './image/helpers'

const extensionRegexp = /\.\w{3,5}$/i

export const isImageRecord = source =>
  isPlainObject(source) && ['mime', 'filename', 'base64'].every(field => field in source)

export const isValidBase64Image = source =>
  isString(source) && source.startsWith('data:image/') && source.includes(';base64,')

export const getBase64Source = source => ({ uri: source })

export const isGoodDollarImage = source => source === -1

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
    const dotExtension = mimeToExtension(mime, { withDot: true })
    const { filename } = imageRecord

    if (!filename.endsWith(dotExtension)) {
      updatedRecord.filename = filename.replace(extensionRegexp, dotExtension)
    }
  }

  return updatedRecord
}

export const resizeImageRecord = async (imageRecord, size) => {
  const resized = await resizeImage(asDataUrl(imageRecord), size)
  const updated = omit(parseDataUrl(resized), 'filename')

  return updateImageRecord(imageRecord, updated)
}

export * from './image/helpers'
export * from './image/resize'
