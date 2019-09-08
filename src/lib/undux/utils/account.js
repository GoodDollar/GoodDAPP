// @flow
import type { Store } from 'undux'
import logger from '../../logger/pino-logger'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../../gundb/UserStorage'

const log = logger.child({ from: 'undux/utils/balance' })

const updateAll = store => {
  return Promise.all([goodWallet.balanceOf(), goodWallet.checkEntitlement()])
    .then(([balance, entitlement]) => {
      const account = store.get('account')
      const balanceChanged = !account.balance || !account.balance.eq(balance)
      const entitlementChanged = !account.entitlement || !account.entitlement.eq(entitlement)

      if (balanceChanged || entitlementChanged || account.ready === false) {
        store.set('account')({ balance, entitlement, ready: true })
      }
    })
    .catch(e => {
      log.error(e.message, e)
    })
}

/**
 * Callback to handle events emmited
 * @param {object} error
 * @param {array} events
 * @param {Store} store
 * @returns {Promise<void>}
 */
const onBalanceChange = async (error: {}, events: [] = [], store: Store) => {
  if (!error && events.length) {
    log.debug('new Transfer events:', { error, events })
    await updateAll(store)
  }
}

const status = {
  started: false,
}

/**
 * Starts listening to Transfer events to (and from) the current account
 */
const initTransferEvents = async (store: Store) => {
  if (!status.started) {
    const lastBlock = await userStorage.getLastBlockNode().then()
    log.debug('starting events listener', { lastBlock })

    status.started = true

    goodWallet.listenTxUpdates(lastBlock, ({ fromBlock, toBlock }) => userStorage.saveLastBlockNumber(toBlock))

    goodWallet.balanceChanged((error, event) => onBalanceChange(error, event, store))
  }
}

export { initTransferEvents, updateAll }
