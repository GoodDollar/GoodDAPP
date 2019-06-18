// @flow
import type { Store } from 'undux'
import logger from '../../logger/pino-logger'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../../gundb/UserStorage'

const log = logger.child({ from: 'undux/utils/balance' })

const updateAll = (store: Store) => {
  return Promise.all([goodWallet.balanceOf(), goodWallet.checkEntitlement()])
    .then(([balance, entitlement]) => {
      const account = store.get('account')
      const balanceChanged = !account.balance || !account.balance.eq(balance)
      const entitlementChanged = !account.entitlement || !account.entitlement.eq(entitlement)

      if (balanceChanged || entitlementChanged || account.ready === false) {
        store.set('account')({ balance, entitlement, ready: true })
      }
    })
    .catch(error => {
      log.error(error)
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
  log.debug('new Transfer events:', { error, events })

  if (!error && events.length) {
    await updateAll(store)
  }
}

const status = {
  started: false
}

/**
 * Starts listening to Transfer events to (and from) the current account
 */
const initTransferEvents = async (store: Store) => {
  if (!status.started) {
    log.debug('checking transfer events')

    status.started = true

    const lastBlock = await userStorage.getLastBlockNode().then()
    log.debug({ lastBlock })
    await goodWallet.listenTxUpdates(lastBlock)

    goodWallet.balanceChanged((error, events) => onBalanceChange(error, events, store))
  }
}

export { initTransferEvents, updateAll }
