import { resizeImage } from './resize'
import { createImage } from './browser'

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
