export default (image, maxWidth, maxHeight) => {
  const canvas = document.createElement('canvas')
  let { width, height } = image

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
