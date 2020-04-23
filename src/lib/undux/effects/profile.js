// @flow
import type { Effects, Store } from 'undux'
import { isNull } from 'lodash'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'
import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'undux/effects/profile' })

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
        if (isNull(store) || isNull(store.storeSnapshot)) {
          return log.warn('withProfile failed', 'received store is null')
        }
        store.set('profile')(userStorage.getDisplayProfile(profile))
        store.set('privateProfile')(await userStorage.getPrivateProfile(profile))
      }
    })
  })
  return store
}

export default withProfile
