// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'

const withProfile: Effects<State> = (store: Store) => {
  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (!isLoggedIn) {
      return
    }

    userStorage.subscribeProfileUpdates(profile => {
      if (profile) {
        store.set('profile')(userStorage.getDisplayProfile(profile))
      }
    })
  })
  return store
}

export default withProfile
