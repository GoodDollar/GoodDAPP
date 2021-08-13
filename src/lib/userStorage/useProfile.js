import { pick } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import userStorage from './UserStorage'

const defaultFields = ['fullName', 'avatar']

const useProfile = (fields = defaultFields) => {
  return useMemo(() => {
    const rawProfile = userStorage.getProfile()
    return pick(rawProfile, fields)
  }, [fields])
}

export const useUserProfile = (walletAddress, fields = defaultFields) => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    userStorage.getProfileByWalletAddress(walletAddress).then(rawProfile => {
      setProfile(pick(rawProfile, fields))
    })
  }, [walletAddress, fields, setProfile])

  return profile
}

export default useProfile
