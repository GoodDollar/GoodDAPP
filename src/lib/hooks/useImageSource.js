import { useEffect, useMemo, useState } from 'react'
import { isNil } from 'lodash'

import userStorage from '../gundb/UserStorage'
import { isGoodDollarImage, isValidBase64Image, isValidLocalImage, isValidRootImage } from '../utils/image'

export default (source, skipCache = false) => {
  // firstly, trying for image sources could be checked syncronously
  const cachedState = useMemo(() => {
    // GD logo (-1)
    if (isGoodDollarImage(source)) {
      return [true, null]
    }

    // local (require()) image (numbers > 0) or relative url (starts with /)
    if (isValidLocalImage(source) || isValidRootImage(source)) {
      return [false, source]
    }

    // base64 data url (checked by regex)
    if (isValidBase64Image(source)) {
      return [false, { uri: source }]
    }

    // if no match - return null
    return [false, null]
  }, [source])

  // using cachedState as initial state value to display avatar immediately
  // if it's an GD logo, local, root or base64 image
  const [sourceState, setSourceState] = useState(cachedState)

  // listening for cachedState changes
  useEffect(() => {
    const [, cachedSource] = cachedState

    // if source was determined in a sync way - set it to state immediately
    if (!isNil(cachedSource)) {
      setSourceState(cachedState)
      return
    }

    // otherwise we're checking is it a valid CID and trying to load it from thes ipfs
    userStorage
      .getAvatar(source, skipCache)
      .catch(() => null)
      .then(base64 => {
        if (!base64) {
          return
        }

        // if no failures and we've got non-empty response - setting base64 received in the state
        setSourceState([false, { uri: base64 }])
      })
  }, [cachedState, source, skipCache, setSourceState])

  return sourceState
}
