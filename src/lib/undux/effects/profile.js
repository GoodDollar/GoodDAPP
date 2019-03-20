// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'

const withProfile: Effects<State> = (store: Store) => {
  store.on('isLoggedInCitizen').subscribe(isLoggedInCitizen => {
    userStorage.getProfile(async profile => {
      const displayProfile = await userStorage.getDisplayProfile(profile)
      store.set('profile')(displayProfile)
    })
  })
  return store
}

export default withProfile
