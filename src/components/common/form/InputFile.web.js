import React, { useCallback, useRef, useState } from 'react'

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
  const [canvas, setCanvas] = useState()
  const [img, setImg] = useState()
  const canvasRef = useCallback(node => {
    if (node !== null) {
      setCanvas(node)
    }
  }, [])

  const imgRef = useCallback(node => {
    if (node !== null) {
      setImg(node)
    }
  }, [])

  const getReducedFileAsDataUrl = (data64, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT) => {

    img.src = data64

    var width = img.width
    var height = img.height

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
    ctx.drawImage(img, 0, 0, width, height)

    return canvas.toDataURL('image/png')
  }

  return (
    <>
      {img && canvas && (
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
              const dataUrl = getReducedFileAsDataUrl(data64Url)
              props.onChange(dataUrl)
            }}
          />
          <label htmlFor="file" style={styles.label}>
            {props.children}
          </label>
        </>
      )}
      <canvas ref={canvasRef} style={{ position: 'absolute', display: 'none' }} />
      <img alt="profile" ref={imgRef} style={{ position: 'absolute', display: 'none' }} />
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
