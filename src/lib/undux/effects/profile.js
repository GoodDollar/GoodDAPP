// @flow
import { debounce } from 'lodash'
import type { Effects, Store } from 'undux'
import { skipWhile, take } from 'rxjs/operators'

import userStorage from '../../userStorage/UserStorage'
import type { State } from '../GDStore'
import { assertStore, assertStoreSnapshot } from '../SimpleStore'

import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'undux/effects/profile' })

/**
 * Undux Effect: On isLoggedIn subscribes the store to profile updates on gundb
 * @param {Store} store
 */
const withProfile: Effects<State> = (store: Store) => {
  if (!assertStore(store, log, 'withProfile failed')) {
    return
  }

  store
    .on('isLoggedIn')
    .pipe(
      skipWhile(isLoggedIn => !isLoggedIn),
      take(1),
    )
    .subscribe(() => {
      const [setProfile, setPrivateProfile] = ['profile', 'privateProfile'].map(key => store.set(key))

      log.debug('Subcribed to the profile updates')

      userStorage.subscribeProfileUpdates(
        debounce(
          async profile => {
            log.debug('Received profile update', { profile })

            if (!profile || !assertStoreSnapshot(store, log, 'withProfile failed')) {
              return
            }

            log.debug('Updating GDStore with the new profile', { profile })

            const displayProfile = userStorage.getDisplayProfile(profile)
            const privateProfile = await userStorage.getPrivateProfile(profile)

            setProfile(displayProfile)
            setPrivateProfile(privateProfile)

            log.debug('GDStore has been updated with the new profile', { profile })
          },
          1000,
          { trailing: true },
        ),
      )
    })

  return store
}

export default withProfile
