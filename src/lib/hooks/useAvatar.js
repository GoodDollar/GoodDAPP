import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import userStorage from '../userStorage/UserStorage'

import { isValidCID } from '../ipfs/utils'
import { isValidDataUrl } from '../utils/base64'
import { useStoreProp } from '../undux/GDStore'
import AsyncStorage from '../utils/asyncStorage'

const useAvatar = avatar => {
  const cachedDataUrl = useMemo(() => {
    // checking is it base64 data url
    if (isValidDataUrl(avatar)) {
      return avatar
    }

    // if not - return null
    return null
  }, [avatar])

  // using cachedState as initial base64 value immediately in the state (if was base64)
  const [dataUrl, setDataUrl] = useState(cachedDataUrl)

  useEffect(() => {
    // if was base64 set it to state immediately
    if (cachedDataUrl) {
      setDataUrl(cachedDataUrl)
      return
    }

    if (!isValidCID(avatar)) {
      return
    }

    // otherwise we're checking is it a valid CID and trying to load it from thes ipfs
    // no need to use useWrappedStorage as we're catching the error
    userStorage
      .loadAvatar(avatar)
      .catch(() => null)
      .then(dataUrl => {
        if (!dataUrl) {
          return
        }

        // if no failures and we've got non-empty response - setting base64 received in the state
        setDataUrl(dataUrl)
      })
  }, [cachedDataUrl, avatar, setDataUrl])

  return dataUrl
}

export const useUploadedAvatar = () => {
  const [uploadedAvatar, setUploadedAvatar] = useStoreProp('uploadedAvatar')
  const [avatarPassed, setAvatarPassed] = useState(() => uploadedAvatar)
  const initialAvatarPassedRef = useRef(avatarPassed)

  const setAvatarJustUploaded = useCallback(
    async avatar => {
      setAvatarPassed(avatar)
      setUploadedAvatar(avatar)
      await AsyncStorage.setItem('GD_uploadedAvatar', avatar)
    },
    [setAvatarPassed, setUploadedAvatar],
  )

  useEffect(() => {
    if (!initialAvatarPassedRef.current) {
      AsyncStorage.getItem('GD_uploadedAvatar').then(avatar => {
        if (!avatar) {
          return
        }

        setAvatarPassed(avatar)
      })
    }

    setUploadedAvatar(null)
    AsyncStorage.removeItem('GD_uploadedAvatar')
  }, [setUploadedAvatar, setAvatarPassed])

  return [avatarPassed, setAvatarJustUploaded]
}

export default useAvatar
