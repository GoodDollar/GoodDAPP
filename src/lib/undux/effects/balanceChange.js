// @flow
import type { Effects, Store } from 'undux'
import { initTransferEvents } from '../utils/account'

import type { State } from '../GDStore'
import logger from '../../logger/pino-logger'
import { assertStore, assertStoreSnapshot } from '../SimpleStore'

const log = logger.child({ from: 'undux/effects/balance' })

const withBalanceChange: Effects<State> = (store: Store) => {
  if (!assertStore(store, log, 'withBalanceChange failed')) {
    return
  }

  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (!assertStoreSnapshot(store, log, 'withBalanceChange failed')) {
      return
    }

    const balanceUpdate = store.get('balanceUpdate')

    log.debug('subscribing to balance changes', isLoggedIn, balanceUpdate)

    if (!balanceUpdate && isLoggedIn) {
      initTransferEvents(store)
      store.set('balanceUpdate')(true)
    }
  })

  return store
}

export default withBalanceChange
