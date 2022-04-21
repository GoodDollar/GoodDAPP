import React from 'react'
import SVG from 'react-inlinesvg'

export const SvgImage = ({ src, width, height }) => <SVG src={src} width={width} height={height} />

export const resolveAssetSource = base64 => {
  if (base64.indexOf('data:image/png;') >= 0) {
    base64 = base64.substring(base64.indexOf(',') + 1)

    const header = atob(base64.slice(0, 50)).slice(16, 24)

    const uint8 = Uint8Array.from(header, c => c.charCodeAt(0))
    const dataView = new DataView(uint8.buffer)

    return {
      width: dataView.getInt32(0),
      height: dataView.getInt32(4),
    }
  }

  if (base64.indexOf('data:image/jpeg;') >= 0) {
    base64 = base64.substring(base64.indexOf(',') + 1)

    const bindata = atob(base64)
    const data = Uint8Array.from(bindata, c => c.charCodeAt(0))

    let off = 0
    while (off < data.length) {
      while (data[off] === 0xff) {
        off++
      }
      const mrkr = data[off]
      off++

      if (mrkr === 0xd8 || mrkr === 0x01 || (0xd0 <= mrkr && mrkr <= 0xd7)) {
        continue
      }
      if (mrkr === 0xd9) {
        break
      }

      let len = (data[off] << 8) | data[off + 1]
      off += 2

      if (mrkr === 0xc0) {
        return {
          type: 'jpeg',
          bpc: data[off], // precission (bits per channel)
          width: (data[off + 1] << 8) | data[off + 2],
          height: (data[off + 3] << 8) | data[off + 4],
          cps: data[off + 5], // number of color components
        }
      }
      off += len - 2
    }
  }

  return {
    width: 0,
    height: 0,
  }
}
