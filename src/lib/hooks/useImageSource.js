import { useEffect, useMemo, useState } from 'react'
import { first, last } from 'lodash'

import UserAvatarStorage from '../gundb/UserAvatarStorage'
import { isValidCID } from '../utils/ipfs'
import { asDataUrl, getBase64Source, isGoodDollarImage, isImageRecord, isValidBase64Image } from '../utils/image'

import logger from '../logger/pino-logger'

const log = logger.child({ from: 'useImageSource' })
const emptySource = [false, null]

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

  return [false, getBase64Source(base64)]
}

export default (source, size = 'small') => {
  // firstly, trying for image sources could be checked syncronously
  const cachedState = useMemo(() => {
    // GD logo (-1)
    if (isGoodDollarImage(source)) {
      return [true, null]
    }

    // check is image record or data url
    return imageToSource(source)
  }, [source])

  // aggregating state variable
  const [sourceState, setSourceState] = useState(() => cachedState || emptySource)

  useEffect(() => {
    // if was GD image, base64 or image record - set it to state immediately
    setSourceState(cachedState || emptySource)

    // if not valid CID - keep 'undefined' profile image
    if (!cachedState || !isValidCID(source)) {
      return
    }

    // otherwise trying to load it from thes ipfs
    UserAvatarStorage.loadAvatar(source, size)
      .catch(() => null)
      .then(imageRecord => {
        if (!imageRecord) {
          return
        }

        // if no failures and we've got non-empty response -
        // updating source according to the record received
        setSourceState(imageToSource(imageRecord))
      })
  }, [cachedState, size, source, setSourceState])

  useEffect(() => {
    const resolved = last(sourceState)
    const isGDLogo = first(sourceState) === true

    log.debug('image source:', { source, isGDLogo, resolved })
  }, [source, sourceState])

  return sourceState
}
