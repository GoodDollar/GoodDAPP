import { Image as NativeImage } from 'react-native'

export const MAX_AVATAR_WIDTH = 600
export const MAX_AVATAR_HEIGHT = 600

const _getReducedDataUrl = (image, width, height) => {
  // create canvas element
  const canvas = document.createElement('canvas')

  // set proper canvas dimensions before transform
  canvas.width = width
  canvas.height = height

  // draw image to canvas
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // get the reduces data url from canvas and return it
  return canvas.toDataURL('image/png')
}

export const resizeBase64Image = async (base64, sizeByWidth) => {
  // caching received image to upload immediately when applying it as image source
  await NativeImage.prefetch(base64)

  // initialize image Object and pass received base64 as source
  const image = new Image()
  image.src = base64

  // prepare resize scale factor properties
  const width = sizeByWidth
  const scaleFactor = width / image.width
  const height = image.height * scaleFactor

  // get reduced data url and return the result
  return _getReducedDataUrl(image, width, height)
}

export const getReducedDataUrlFromImage = (image, maxWidth, maxHeight) => {
  let { width, height } = image

  if (width > height && width > maxWidth) {
    height *= maxWidth / width
    width = maxWidth
  } else if (height > maxHeight) {
    width *= maxHeight / height
    height = maxHeight
  }

  return _getReducedDataUrl(image, width, height)
}
