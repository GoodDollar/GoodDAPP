import { useEffect, useMemo, useState } from 'react'

import UserAvatarStorage from '../gundb/UserAvatarStorage'
import { isValidBase64Image } from '../utils/image'
import { isValidCID } from '../utils/ipfs'

export default (avatar, skipCache = false) => {
  const cachedBase64 = useMemo(() => {
    // checking is it base64 data url
    if (isValidBase64Image(avatar)) {
      return avatar
    }

    // if not - return null
    return null
  }, [avatar])

  // using cachedState as initial base64 value immediately in the state (if was base64)
  const [base64, setBase64] = useState(cachedBase64)

  useEffect(() => {
    // if was base64 set it to state immediately
    if (cachedBase64) {
      setBase64(cachedBase64)
      return
    }

    if (!isValidCID(avatar)) {
      return
    }

    // otherwise we're checking is it a valid CID and trying to load it from thes ipfs
    UserAvatarStorage.load(avatar, skipCache)
      .catch(() => null)
      .then(base64 => {
        if (!base64) {
          return
        }

        // if no failures and we've got non-empty response - setting base64 received in the state
        setBase64(base64)
      })
  }, [cachedBase64, avatar, skipCache, setBase64])

  return base64
}
