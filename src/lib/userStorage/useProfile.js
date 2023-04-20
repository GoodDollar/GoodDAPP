import { pick } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useUserStorage } from '../wallet/GoodWalletProvider'

const defaultPublicFields = ['fullName', 'smallAvatar']

const useProfileHook = (fields, allowRefresh = false, display = false) => {
  const [profile, setProfile] = useState({})
  const userStorage = useUserStorage()

  const getProfile = useCallback(
    (fields, display) => {
      if (!userStorage) {
        return {}
      }
      const profile = display ? userStorage.getDisplayProfile() : userStorage.getPrivateProfile()

      return fields ? pick(profile, fields) : profile
    },
    [userStorage],
  )

  const refreshProfile = useCallback(() => setProfile(getProfile(fields, display)), [
    fields,
    display,
    setProfile,
    getProfile,
  ])

  // auto refresh provide each time fields and private changes
  // also initializes profile on mount
  useEffect(() => void refreshProfile(), [refreshProfile])

  return useMemo(() => (allowRefresh ? [profile, refreshProfile] : profile), [profile, refreshProfile, allowRefresh])
}

const useProfile = (allowRefresh = false, fields = null) => useProfileHook(fields, allowRefresh)

export const usePublicProfile = (allowRefresh = false, fields = null) => useProfileHook(fields, allowRefresh, true)

export const usePublicProfileOf = (walletAddress, fields = defaultPublicFields) => {
  const [profile, setProfile] = useState(null)
  const userStorage = useUserStorage()

  useEffect(() => {
    userStorage
      .getPublicProfile('walletAddress', walletAddress)
      .then(rawProfile => setProfile(pick(rawProfile, fields)))
  }, [walletAddress, fields, setProfile])

  return profile
}

const getUserProperty = (userStorage, property, local = false) => {
  if (!userStorage) {
    return null
  }

  const { userProperties } = userStorage

  return local ? userProperties.getLocal(property) : userProperties.get(property)
}

export const useUserProperty = (property, local = false) => {
  const userStorage = useUserStorage()

  const [propertyValue, setPropertyValue] = useState(() => getUserProperty(userStorage, property, local))

  const updatePropertyValue = useCallback(
    newValue => {
      const { userProperties } = userStorage

      setPropertyValue(newValue)

      if (local) {
        userProperties.setLocal(property, newValue)
        return
      }

      userProperties.safeSet(property, newValue)
    },
    [setPropertyValue, userStorage, property, local],
  )

  useEffect(() => {
    const { userProperties } = userStorage

    setPropertyValue(getUserProperty(userStorage, property, local))
    if (!local) {
      userProperties.on(property, setPropertyValue)
    }
    return () => {
      if (local) {
        return
      }

      userProperties.off(property, setPropertyValue)
    }
  }, [property, userStorage, setPropertyValue, local])

  return [propertyValue, updatePropertyValue]
}

export const useLocalProperty = property => useUserProperty(property, true)

export default useProfile
