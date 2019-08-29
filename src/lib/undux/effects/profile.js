// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import { checkAuthStatus } from '../../login/checkAuthStatus'
import type { State } from '../GDStore'

/**
 * Undux Effect: On isLoggedIn subscribes the store to profile updates on gundb
 * @param {Store} store
 */
const withProfile: Effects<State> = (store: Store) => {
  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (!isLoggedIn) {
      // Listen to 'registered' changes on gundb
      // This is done due to time restrains.
      // After signup flow, 'registered' is not yet set before it's queried by `checkAuthStatus`, which leads to `isLoggedIn === false`.
      // After 'registered' value is set, we re-check the auth-status, getting a `isLoggedIn === true`
      userStorage.profile.get('registered').on(async () => {
        const isRegistered = await userStorage.getProfileFieldValue('registered')

        if (isRegistered) {
          // if user is registered re-check the auth-status
          const { isLoggedIn } = await checkAuthStatus()

          if (isLoggedIn) {
            // if in fact it's logged in, we update its value in the store...
            store.set('isLoggedIn')(isLoggedIn)

            // ... and stop listening for 'registered' changes
            userStorage.profile.get('registered').off()
          }
        }
      })

      // do nothing else until store's `isLoggedIn === true`
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
