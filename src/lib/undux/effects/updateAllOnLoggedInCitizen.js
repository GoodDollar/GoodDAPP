// @flow
import type { Effects, Store } from 'undux'
import type { State } from '../GDStore'

import { updateAll } from '../utils/account'
import API from '../../API/api'

import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'updateAllOnLoggedInCitizen' })

/**
 * Undux Effect: On isLoggedIn fires an updateAll
 * @param {Store} store
 */
const updateAllOnLoggedInCitizen: Effects<State> = (store: Store) => {
  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (isLoggedIn) {
      updateAll(store)
    }
  })
  store.on('isLoggedInCitizen').subscribe(isLoggedInCitizen => {
    if (isLoggedInCitizen) {
      updateAll(store)
      API.verifyTopWallet()
        .then(r => log.debug('Top Wallet Result:', r))
        .catch(e => log.error('Top Wallet Error:', e.message, e))
    }
  })
}

export default updateAllOnLoggedInCitizen
