import { mapValues, pick } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import userStorage from './UserStorage'

const defaultFields = ['fullName', 'avatar']

const useProfile = (fields = defaultFields) =>
  useMemo(() => {
    const rawProfile = userStorage.getProfile()

    return pick(rawProfile, fields)
  }, [fields])

export const useUserProfile = (walletAddress, fields = defaultFields) => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    userStorage
      .getProfileByWalletAddress(walletAddress)
      .then(rawProfile => setProfile(mapValues(pick(rawProfile, fields), 'display')))
  }, [walletAddress, fields, setProfile])

  return profile
}

export default useProfile
