// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'

/**
 * Undux Effect: On isLoggedIn subscribes the store to profile updates on gundb
 * @param {Store} store
 */
const withProfile: Effects<State> = (store: Store) => {
  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (!isLoggedIn) {
      return
    }

    userStorage.subscribeProfileUpdates(async profile => {
      if (profile) {
        store.set('profile')(userStorage.getDisplayProfile(profile))
        store.set('privateProfile')(await userStorage.getPrivateProfile(profile))
      }
    })
  })
  return store
}

export default withProfile
