// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'
import { assertStore, assertStoreSnapshot } from '../SimpleStore'
import logger from '../../logger/pino-logger'
import { delay } from '../../utils/async'
const log = logger.child({ from: 'undux/effects/profile' })

/**
 * Undux Effect: On isLoggedIn subscribes the store to profile updates on gundb
 * @param {Store} store
 */
const withProfile: Effects<State> = (store: Store) => {
  if (!assertStore(store, log, 'withProfile failed')) {
    return
  }

  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (!isLoggedIn) {
      return
    }

    userStorage.subscribeProfileUpdates(async profile => {
      if (profile) {
        if (!assertStoreSnapshot(store, log, 'withProfile failed')) {
          return
        }

        store.set('profile')(userStorage.getDisplayProfile(profile))

        //the SEA encrypted data might not have been saved yet, give it some time
        await delay(1000)
        store.set('privateProfile')(await userStorage.getPrivateProfile(profile))
      }
    })
  })
  return store
}

export default withProfile
