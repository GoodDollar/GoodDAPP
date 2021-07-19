import { useEffect, useState } from 'react'

import avatarStorage from '../gundb/UserAvatarStorage'
import { isValidCID } from '../utils/ipfs'
import { asDataUrl, isGoodDollarImage, isImageRecord, isValidBase64Image } from '../utils/image'

// import logger from '../logger/pino-logger'

// const log = logger.child({ from: 'useImageSource' })
// const emptySource = [false, null]

const imageToSource = source => {
  // checking is image record or base64 data url
  const isRecord = isImageRecord(source)

  // if not return null
  if (!isRecord && !isValidBase64Image(source)) {
    return null
  }

  let base64 = source

  if (isRecord) {
    // assemble data url from image record
    base64 = asDataUrl(source)
  }

  return { uri: base64 }
}

export default (source, size = 'small') => {
  const [image, setImage] = useState()

  useEffect(() => {
    // if was GD image, base64 or image record - set it to state immediately
    // if not valid CID - keep 'undefined' profile image
    const validImage = imageToSource(source)

    if ((!validImage || isGoodDollarImage(source)) && !isValidCID(source)) {
      return
    }

    //already base64?
    if (validImage) {
      return setImage(validImage)
    }

    // otherwise trying to load it from thes ipfs
    avatarStorage
      .loadAvatar(source, size)
      .catch(() => null)
      .then(imageRecord => {
        if (!imageRecord) {
          return
        }

        // if no failures and we've got non-empty response -
        // updating source according to the record received
        setImage(imageToSource(imageRecord))
      })
  }, [size, source, setImage])

  return image
}
