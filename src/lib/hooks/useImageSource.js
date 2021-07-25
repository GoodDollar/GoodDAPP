import { useMemo } from 'react'

import { isGoodDollarImage, isValidLocalImage, isValidRootImage } from '../utils/image'
import useProfileAvatar from './useProfileAvatar'

export default (source, skipCache = false) => {
  // firstly, trying for image sources could be checked syncronously
  const cachedState = useMemo(() => {
    // GD logo (-1)
    if (isGoodDollarImage(source) || isValidLocalImage(source) || isValidRootImage(source)) {
      return source
    }
    return null
  }, [source])

  // if GD, local or root image was detected - pass null to skip loading
  const base64 = useProfileAvatar(cachedState ? null : source, skipCache)

  // aggregating memo
  const sourceState = useMemo(() => {
    // if was base64 or was loaded form ipfs - return data url
    if (base64) {
      return { uri: base64 }
    }

    // otherwise return unknown profile image
    return source
  }, [source, base64])

  return sourceState
}
