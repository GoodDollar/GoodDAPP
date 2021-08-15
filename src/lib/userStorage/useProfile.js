import { mapValues, pick } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import userStorage from './UserStorage'

const defaultPublicFields = ['fullName', 'smallAvatar']

const useProfile = fields =>
  useMemo(() => {
    const rawProfile = userStorage.getProfile()
    if (fields) {
      return pick(rawProfile, fields)
    }
    return rawProfile
  }, [fields])

export const useUserProfile = (walletAddress, fields = defaultPublicFields) => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    userStorage
      .getProfileByWalletAddress(walletAddress)
      .then(rawProfile => setProfile(mapValues(pick(rawProfile, fields), 'display')))
  }, [walletAddress, fields, setProfile])

  return profile
}

export default useProfile
