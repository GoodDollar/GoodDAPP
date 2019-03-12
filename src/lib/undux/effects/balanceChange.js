// @flow
import type { Effects, Store } from 'undux'

import { initTransferEvents } from '../../undux/utils/account'
import type { State } from '../GDStore'

const withBalanceChange: Effects<State> = (store: Store) => {
  store.on('account').subscribe(async ({ ready }) => {
    const balanceUpdate = store.get('balanceUpdate')

    if (!balanceUpdate.running && ready) {
      await initTransferEvents(store)
      balanceUpdate.running = true
      store.set('balanceUpdate')(balanceUpdate)
    }
  })

  return store
}

export default withBalanceChange
