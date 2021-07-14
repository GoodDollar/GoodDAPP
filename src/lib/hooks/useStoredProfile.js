import { useEffect, useRef, useState } from 'react'
import { isEqual } from 'lodash'

import GDStore, { useCurriedSetters } from '../undux/GDStore'
import userStorage from '../gundb/UserStorage'

export default (withLocalState = false) => {
  const store = GDStore.useStore()
  const storedProfile = store.get('privateProfile')
  const [setPrivateProfile] = useCurriedSetters(['privateProfile'])
  const [profile, setProfile] = useState(() => (withLocalState ? storedProfile : null))

  const initialProfileRef = useRef(storedProfile)
  const initialLocalStateFlagRef = useRef(withLocalState)

  useEffect(() => {
    if (!isEqual(initialProfileRef.current, {})) {
      return
    }

    // initialize profile value for first time from storedProfile in userStorage
    userStorage.getProfile().then(loadedProfile => {
      setPrivateProfile(loadedProfile)

      if (initialLocalStateFlagRef.current) {
        setProfile(loadedProfile)
      }
    })
  }, [setPrivateProfile, setProfile])

  if (withLocalState) {
    return [storedProfile, profile, setProfile]
  }

  return storedProfile
}
