import { mapValues, pick } from 'lodash'
import { useEffect, useState } from 'react'

import userStorage from './UserStorage'

const defaultPublicFields = ['fullName', 'smallAvatar']

const useProfile = fields => {
  const rawProfile = userStorage.getPrivateProfile()
  if (fields) {
    return pick(rawProfile, fields)
  }
  return rawProfile
}

export const useDisplayProfile = fields => {
  const rawProfile = userStorage.getDisplayProfile()
  if (fields) {
    return pick(rawProfile, fields)
  }
  return rawProfile
}

export const useUserProfile = (walletAddress, fields = defaultPublicFields) => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    userStorage
      .getPublicProfile('walletAddress', walletAddress)
      .then(rawProfile => setProfile(mapValues(pick(rawProfile, fields), 'display')))
  }, [walletAddress, fields, setProfile])

  return profile
}

export default useProfile
