import { Platform } from 'react-native'

export default (base64, sizeByWidth) => {
  return new Promise((resolve, reject) => {
    // FIXME: RN
    if (Platform.OS !== 'web') {
      return resolve(base64)
    }

    const img = new Image()

    img.onload = function() {
      const elem = document.createElement('canvas')

      const width = sizeByWidth
      const scaleFactor = width / img.width

      elem.width = width
      elem.height = img.height * scaleFactor

      const ctx = elem.getContext('2d')
      ctx.drawImage(img, 0, 0, width, img.height * scaleFactor)

      resolve(elem.toDataURL())
    }

    img.onerror = () => {
      resolve(null)
    }

    img.src = base64
  })
}
