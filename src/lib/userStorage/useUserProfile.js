// an useGunProfile hook implementation for the RealmDB
import { mapValues, pick } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

// import logger from '../logger/pino-logger'
import userStorage from './UserStorage'

// const log = logger.child({ from: 'useUserProfile' })

const useUserProfile = (identifier, fields = ['fullName', 'smallAvatar']) => {
  const [profile, setProfile] = useState(null)

  const updateProfile = useCallback(profile => setProfile(mapValues(pick(profile, fields), 'display')), [
    setProfile,
    fields,
  ])

  useEffect(() => {
    let hookCancelled = false

    userStorage.getProfile(identifier).then(async profile => {
      if (hookCancelled) {
        return
      }
      updateProfile(profile)

      for await (const { fullDocument } of userStorage.db.watchProfile(identifier)) {
        if (hookCancelled) {
          break
        }
        updateProfile(fullDocument)
      }
    })

    return () => void (hookCancelled = true)
  }, [identifier, updateProfile])

  return profile
}

export default useUserProfile
