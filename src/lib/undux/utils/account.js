// @flow
import type { Store } from 'undux'
import { isNull } from 'lodash'
import logger from '../../logger/pino-logger'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../../gundb/UserStorage'

const log = logger.child({ from: 'undux/utils/balance' })

const updateAll = store => {
  return Promise.all([goodWallet.balanceOf(), goodWallet.checkEntitlement()])
    .then(([balance, entitlement]) => {
      if (isNull(store)) {
        log.warn('updateAll failed', 'received store is null')
      } else {
        const account = store.get('account')
        const balanceChanged = !account.balance || account.balance !== balance
        const entitlementChanged = !account.entitlement || !account.entitlement.eq(entitlement)

        if (balanceChanged || entitlementChanged || account.ready === false) {
          store.set('account')({ balance, entitlement, ready: true })
        }
      }
    })
    .catch(e => {
      log.error('updateAll failed', e.message, e)
    })
}

/**
 * Callback to handle events emmited
 * @param {object} error
 * @param {array} events
 * @param {Store} store
 * @returns {Promise<void>}
 */
const onBalanceChange = async (event: EventLog, store: Store) => {
  if (event) {
    log.debug('new Transfer events:', { event, store })
    await updateAll(store)
  }
}

/**
 * Starts listening to Transfer events to (and from) the current account
 */
let balanceChangedSub
const initTransferEvents = async (store: Store) => {
  const lastBlock = await userStorage.getLastBlockNode().then()
  log.debug('starting events listener', { lastBlock })

  goodWallet.listenTxUpdates(parseInt(lastBlock), ({ fromBlock, toBlock }) =>
    userStorage.saveLastBlockNumber(parseInt(toBlock) + 1)
  )

  if (balanceChangedSub) {
    log.debug('removing old subscription', balanceChangedSub)
    goodWallet.unsubscribeFromEvent(balanceChangedSub)
  }
  balanceChangedSub = goodWallet.balanceChanged(event => onBalanceChange(event, store))
}

export { initTransferEvents, updateAll }
