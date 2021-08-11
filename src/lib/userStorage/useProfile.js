import { isEmpty, mapValues, pick } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import userStorage from './UserStorage'

const defaultFields = ['fullName', 'smallAvatar']

const publicValues = (profile, fields) => {
  let filteredProfile = profile

  if (fields && !isEmpty(fields)) {
    filteredProfile = pick(profile, fields)
  }

  return mapValues(filteredProfile, 'display')
}

const useProfile = (fields = defaultFields) => {
  const profile = useMemo(() => {
    const rawProfile = userStorage.getProfile()

    return publicValues(rawProfile, fields)
  }, [fields])

  return profile
}

export const useUserProfile = (walletAddress, fields = defaultFields) => {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    userStorage.getProfileByWalletAddress(walletAddress).then(rawProfile => {
      setProfile(publicValues(rawProfile, fields))
    })
  }, [walletAddress, fields, setProfile])

  return profile
}

export default useProfile
