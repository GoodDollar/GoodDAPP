import React, { useRef } from 'react'
import logger from '../../../lib/logger/pino-logger'
const log = logger.child({ from: 'InputFile' })

const MAX_WIDTH = 600
const MAX_HEIGHT = 600

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

const InputFile = props => {
  const inputRef = useRef(null)

  const getReducedFileAsDataUrl = async (file, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT) => {
    const data64 = await toBase64(file)
    const img = await getImageWithSrc(data64)
    const dataUrl = getReducedDataUrlWithImage(img, maxWidth, maxHeight)

    log.debug('getReducedFileAsDataUrl', { data64, img, dataUrl })
    return dataUrl
  }

  const getReducedDataUrlWithImage = (image, maxWidth, maxHeight) => {
    const canvas = document.createElement('canvas')

    let width = image.width
    let height = image.height

    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height
        height = maxHeight
      }
    }
    canvas.width = width
    canvas.height = height

    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    const dataUrl = canvas.toDataURL('image/png')
    log.debug('getReducedDataUrlWithImage', { ctx, canvas, dataUrl })

    return dataUrl
  }

  const getImageWithSrc = src => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = function() {
        resolve(img)
      }
      img.src = src
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        name="file"
        style={styles.input}
        accept="image/*"
        onChange={async event => {
          event.preventDefault()
          const [file] = inputRef.current.files
          const dataUrl = await getReducedFileAsDataUrl(file)
          props.onChange(dataUrl)
        }}
      />
      <label htmlFor="file" style={styles.label}>
        {props.children}
      </label>
    </>
  )
}

const styles = {
  input: {
    opacity: 0,
  },
  label: {
    display: 'inline-block',
    cursor: 'pointer',
  },
}
export default InputFile
