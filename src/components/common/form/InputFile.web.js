// libraries
import React, { useRef } from 'react'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import logger from '../../../lib/logger/pino-logger'
import getReducedDataUrlFromImage from '../../../lib/utils/getReducedDataUrlFromImage'

const log = logger.child({ from: 'InputFile' })

const MAX_AVATAR_WIDTH = 600
const MAX_AVATAR_HEIGHT = 600

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

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

const InputFile = props => {
  const { children, onChange } = props
  const inputRef = useRef(null)

  // need to prevent default event - useOnPress does it
  const handleInputChange = useOnPress(async () => {
    const [file] = inputRef.current.files
    const data64 = await toBase64(file)
    const image = await getImageWithSrc(data64)

    log.debug('Uploaded file to use as avatar', { file })

    // getting the reduces data url
    const dataUrl = await getReducedDataUrlFromImage(image, MAX_AVATAR_WIDTH, MAX_AVATAR_HEIGHT)

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
