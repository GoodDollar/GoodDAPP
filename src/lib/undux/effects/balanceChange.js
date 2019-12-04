// @flow
import type { Effects, Store } from 'undux'

import { initTransferEvents } from '../../undux/utils/account'
import type { State } from '../GDStore'
import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'undux/utils/balance' })

const withBalanceChange: Effects<State> = (store: Store) => {
  store.on('isLoggedIn').subscribe(isLoggedIn => {
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
