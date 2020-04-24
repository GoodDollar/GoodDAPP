// @flow
import type { Effects, Store } from 'undux'
import { isNull } from 'lodash'
import { initTransferEvents } from '../utils/account'

import type { State } from '../GDStore'
import logger from '../../logger/pino-logger'
import { assertStoreSnapshot } from '../SimpleStore'

const log = logger.child({ from: 'undux/effects/balance' })

const withBalanceChange: Effects<State> = (store: Store) => {
  if (!assertStoreSnapshot(store, log, 'withBalanceChange failed')) {
    return
  }

  store.on('isLoggedIn').subscribe(isLoggedIn => {
    if (isNull(store) || isNull(store.storeSnapshot)) {
      return log.warn('withBalanceChange failed', 'received store is null')
    }

    const balanceUpdate = store.get('balanceUpdate')
    log.debug('subscribing to balance changes', isLoggedIn, store, balanceUpdate)
    if (!balanceUpdate && isLoggedIn) {
      initTransferEvents(store)
      store.set('balanceUpdate')(true)
    }
  })

  return store
}

export default withBalanceChange
