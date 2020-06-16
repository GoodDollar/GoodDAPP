// libraries
import React, { useCallback, useRef } from 'react'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
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
  const { children, onChange } = props
  const inputRef = useRef(null)

  const getReducedFileAsDataUrl = useCallback(async (file, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT) => {
    const data64 = await toBase64(file)
    const img = await getImageWithSrc(data64)

    // standard orientation
    const orientation = 1

    // getting the reduces data url
    const dataUrl = getReducedDataUrlFromImage(img, orientation, maxWidth, maxHeight)

    log.debug('getReducedFileAsDataUrl', { data64, img, dataUrl, orientation })

    return dataUrl
  }, [])

  const getReducedDataUrlFromImage = useCallback((image, srcOrientation, maxWidth, maxHeight) => {
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
    const dataUrl = canvas.toDataURL('image/png')

    log.debug('getReducedDataUrlWithImage', { ctx, canvas, dataUrl })

    return dataUrl
  }, [])

  const getImageWithSrc = useCallback(src => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = function() {
        resolve(img)
      }
      img.src = src
    })
  }, [])

  // need to prevent default event - useOnPress does it
  const handleInputChange = useOnPress(async () => {
    const [file] = inputRef.current.files
    const dataUrl = await getReducedFileAsDataUrl(file)

    onChange(dataUrl)
  }, [onChange])

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        name="file"
        style={styles.input}
        accept="image/*"
        onChange={handleInputChange}
      />
      <label htmlFor="file" style={styles.label}>
        {children}
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
