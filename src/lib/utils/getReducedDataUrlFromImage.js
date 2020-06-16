import fileToBase64 from './fileToBase64'

const getImageWithSrc = src => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = function() {
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

export default async (imageFile, maxWidth, maxHeight) => {
  const data64 = await fileToBase64(imageFile)
  const image = await getImageWithSrc(data64)
  const canvas = document.createElement('canvas')

  let width = image.width
  let height = image.height

  if (width > height && width > maxWidth) {
    height *= maxWidth / width
    width = maxWidth
  } else if (height > maxHeight) {
    width *= maxHeight / height
    height = maxHeight
  }

  // set proper canvas dimensions before transform & export
  canvas.width = width
  canvas.height = height

  // draw image to the canvas
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // get the reduces data url from canvas and return it
  return canvas.toDataURL('image/png')
}
