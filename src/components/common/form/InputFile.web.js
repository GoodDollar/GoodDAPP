import React, { useRef } from 'react'

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
  const inputRef = useRef()
  const canvas = useRef()
  const img = useRef()

  const getReducedFileAsDataUrl = (data64, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT) => {
    img.current.src = data64

    var width = img.current.width
    var height = img.current.height

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
    canvas.current.width = width
    canvas.current.height = height
    var ctx = canvas.current.getContext('2d')
    ctx.drawImage(img.current, 0, 0, width, height)

    return canvas.current.toDataURL('image/png')
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        name="file"
        style={styles.input}
        onChange={async event => {
          event.preventDefault()
          const [file] = inputRef.current.files
          const data64Url = await toBase64(file)
          const dataUrl = await getReducedFileAsDataUrl(data64Url)
          console.info({ file, dataUrl, data64Url })
          props.onChange(dataUrl)
        }}
      />
      <canvas ref={canvas} style={{ position: 'absolute', display: 'none' }} />
      <img alt="profile" ref={img} style={{ position: 'absolute', display: 'none' }} />
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
