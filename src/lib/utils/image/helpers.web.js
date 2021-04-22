import { Image as NativeImage } from 'react-native'

/**
 * Creates Image() instance and preloads image from then source or data URL
 * @param {Image | string} imageSource
 */
export const createImage = async imageSource => {
  if (imageSource instanceof Image) {
    return imageSource
  }

  const image = new Image()

  await NativeImage.prefetch(imageSource)
  image.src = imageSource

  return image
}

/**
 * Resizes image to the specified dimensions
 *
 * @param {Image | string} imageSource Image source or data URL
 * @param {number} targetWidth Resized image width
 * @param {number?} targetHeight Resized image height (optional)
 */
export const resizeImage = async (imageSource, targetWidth, targetHeight = null) => {
  const canvas = document.createElement('canvas')
  const image = await createImage(imageSource)
  let { width, height } = image

  // prepare resize scale factor properties
  height = targetHeight || (height * targetWidth) / width
  width = targetWidth

  // resize image using Canvas
  Object.assign(canvas, { width, height })
  canvas.getContext('2d').drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/png')
}

/**
 * Adjusts image size relative to specified constaints
 *
 * @param {Image | string} imageSource Image source or data URL
 * @param {number} maxWidth Maximum image width constrain to
 * @param {number?} maxHeight Maximum image height constrain to (optional)
 */
export const constrainImage = async (imageSource, maxWidth, maxHeight = null) => {
  const image = await createImage(imageSource)
  let { width, height } = image

  if ((width > height || !maxHeight) && width > maxWidth) {
    height *= maxWidth / width
    width = maxWidth
  } else if (height > maxHeight) {
    width *= maxHeight / height
    height = maxHeight
  }

  return resizeImage(image, width, height)
}
