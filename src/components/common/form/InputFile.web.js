import React, { useRef } from 'react'
import logger from '../../../lib/logger/pino-logger'
const log = logger.child({ from: 'InputFile' })

const MAX_WIDTH = 600
const MAX_HEIGHT = 600

function getOrientation(file) {
  return new Promise(resolve => {
    var reader = new FileReader()
    reader.onload = function(e) {
      var view = new DataView(e.target.result)
      if (view.getUint16(0, false) != 0xffd8) {
        resolve(-2)
      }
      var length = view.byteLength,
        offset = 2
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(-1)
        }
        const marker = view.getUint16(offset, false)
        offset += 2
        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            resolve(-1)
          }

          const little = view.getUint16((offset += 6), false) == 0x4949
          offset += view.getUint32(offset + 4, little)
          const tags = view.getUint16(offset, little)
          offset += 2
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little))
            }
          }
        } else if ((marker & 0xff00) == 0xff00) {
          offset += view.getUint16(offset, false)
        } else {
          break
        }
      }
      resolve(-1)
    }
    reader.readAsArrayBuffer(file)
  })
}

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
    const orientation = await getOrientation(file)

    const dataUrl = getReducedDataUrlWithImage(img, orientation, maxWidth, maxHeight)
    getOrientation(file, orientation => alert(orientation))
    log.debug('getReducedFileAsDataUrl', { data64, img, dataUrl, orientation })
    return dataUrl
  }

  const getReducedDataUrlWithImage = (image, srcOrientation, maxWidth, maxHeight) => {
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

    // set proper canvas dimensions before transform & export
    if (4 < srcOrientation && srcOrientation < 9) {
      canvas.width = height
      canvas.height = width
    } else {
      canvas.width = width
      canvas.height = height
    }
    var ctx = canvas.getContext('2d')

    // transform context before drawing image
    switch (srcOrientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0)
        break
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height)
        break
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height)
        break
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0)
        break
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0)
        break
      case 7:
        ctx.transform(0, -1, -1, 0, height, width)
        break
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width)
        break
      default:
        break
    }

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
