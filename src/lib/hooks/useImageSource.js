import { useEffect, useMemo } from 'react'
import { first, last } from 'lodash'

import { isGoodDollarImage } from '../utils/image'
import logger from '../logger/pino-logger'
import useProfileAvatar from './useProfileAvatar'

const log = logger.child({ from: 'useImageSource' })

export default (source, skipCache = false) => {
  // firstly, trying for image sources could be checked syncronously
  const cachedState = useMemo(() => {
    // GD logo (-1)
    if (isGoodDollarImage(source)) {
      return [true, null]
    }

    // if no match - return null
    return null
  }, [source])

  // if GD, local or root image was detected - pass null to skip loading
  const base64 = useProfileAvatar(cachedState ? null : source, skipCache)

  // aggregating memo
  const sourceState = useMemo(() => {
    // if GD, local or root image - return cached value
    if (cachedState) {
      return cachedState
    }

    // if was base64 or was loaded form ipfs - return data url
    if (base64) {
      return [false, { uri: base64 }]
    }

    // otherwise return unknown profile image
    return [false, null]
  }, [cachedState, base64])

  useEffect(() => {
    const resolved = last(sourceState)
    const isGDLogo = first(sourceState) === true

    log.debug('image source:', { source, isGDLogo, resolved })
  }, [source, sourceState])

  return sourceState
}
