import { pick } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

import userStorage from './UserStorage'

const defaultPublicFields = ['fullName', 'smallAvatar']

const getProfile = (fields, display) => {
  const profile = display ? userStorage.getDisplayProfile() : userStorage.getPrivateProfile()

  return fields ? pick(profile, fields) : profile
}

const useProfileHook = (fields, allowRefresh = false, display = false) => {
  const [profile, setProfile] = useState(() => getProfile(fields, display))

  const refreshProfile = useCallback(() => setProfile(getProfile(fields, display)), [fields, display, setProfile])

  // auto refresh provide each time fields and private changes
  useEffect(() => void refreshProfile(), [refreshProfile])

  return useMemo(() => (allowRefresh ? [profile, refreshProfile] : profile), [profile, refreshProfile, allowRefresh])
}

const useProfile = (allowRefresh = false, fields = null) => useProfileHook(fields, allowRefresh)
export const usePublicProfile = (allowRefresh = false, fields = null) => useProfileHook(fields, allowRefresh, true)

export const usePublicProfileOf = (walletAddress, fields = defaultPublicFields) => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    userStorage
      .getPublicProfile('walletAddress', walletAddress)
      .then(rawProfile => setProfile(pick(rawProfile, fields)))
  }, [walletAddress, fields, setProfile])

  return profile
}

export default useProfile
