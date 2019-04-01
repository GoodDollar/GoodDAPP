// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'

const withProfile: Effects<State> = (store: Store) => {
  store.on('isLoggedInCitizen').subscribe(isLoggedInCitizen => {
    if (!isLoggedInCitizen) return

    userStorage.subscribeProfileUpdates(profile => {
      userStorage.getDisplayProfile(profile).then(store.set('profile'))
    })
  })
  return store
}

export default withProfile
