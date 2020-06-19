// libraries
import React, { useRef } from 'react'
import FileAPI from 'promisify-file-reader'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import logger from '../../../lib/logger/pino-logger'
import { constrainImage, createImage, MAX_AVATAR_HEIGHT, MAX_AVATAR_WIDTH } from '../../../lib/utils/image'

const log = logger.child({ from: 'InputFile' })

const InputFile = props => {
  const { children, onChange } = props
  const inputRef = useRef(null)

  // need to prevent default event - useOnPress does it
  const handleInputChange = useOnPress(async () => {
    const [file] = inputRef.current.files
    const imageSource = await FileAPI.readAsDataURL(file)
    const image = await createImage(imageSource)

    log.debug('Uploaded file to use as avatar', { file, image })

    // getting the reduces data url
    const dataUrl = await constrainImage(image, MAX_AVATAR_WIDTH, MAX_AVATAR_HEIGHT)

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
