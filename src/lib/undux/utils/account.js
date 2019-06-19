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
      if (account.balance === balance && account.entitlement === entitlement && account.ready === true) {
        return
      }

      store.set('account')({ balance, entitlement, ready: true })
    })
    .catch(error => {
      log.error(error)
    })
}

/**
 * Callback to handle events emmited
 * @param error
 * @param event
 * @param store
 * @returns {Promise<void>}
 */
const onBalanceChange = async (error: {}, event: [any], store: Store) => {
  log.debug('new Transfer event:', { error, event })

  if (!error) {
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

    goodWallet.balanceChanged((error, event) => onBalanceChange(error, event, store))
  }
}

export { initTransferEvents, updateAll }
