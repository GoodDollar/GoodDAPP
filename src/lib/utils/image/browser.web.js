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
