import { parseDataUrl } from './helpers'
import { createImage } from './browser'

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
  const { mime } = parseDataUrl(image.src)
  let { width, height } = image

  // prepare resize scale factor properties
  height = targetHeight || (height * targetWidth) / width
  width = targetWidth

  // resize image using Canvas
  Object.assign(canvas, { width, height })
  canvas.getContext('2d').drawImage(image, 0, 0, width, height)

  return canvas.toDataURL(mime || 'image/png')
}
