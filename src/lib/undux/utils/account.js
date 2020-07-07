// @flow
import type { Store } from 'undux'
import logger from '../../logger/pino-logger'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../../gundb/UserStorage'
import { assertStore } from '../SimpleStore'

const log = logger.child({ from: 'undux/utils/account' })

const updateAll = async store => {
  let walletOperations

  try {
    walletOperations = await Promise.all([goodWallet.balanceOf(), goodWallet.checkEntitlement()])
  } catch (exception) {
    const { message } = exception

    log.error('updateAll failed', message, exception)
    return
  }

  if (!assertStore(store, log, 'updateAll failed')) {
    return
  }

  try {
    const [balance, entitlement] = walletOperations
    const account = store.get('account')
    const balanceChanged = !account.balance || account.balance != balance
    const entitlementChanged = !account.entitlement || !account.entitlement.eq(entitlement)

    if (balanceChanged || entitlementChanged || account.ready === false) {
      store.set('account')({ balance, entitlement, ready: true })
    }
  } catch (exception) {
    const { message } = exception

    log.warn('updateAll failed', `Store failed with exception: ${message}`, exception)
    return
  }
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
    userStorage.saveLastBlockNumber(parseInt(toBlock) + 1),
  )

  if (balanceChangedSub) {
    log.debug('removing old subscription', balanceChangedSub)
    goodWallet.unsubscribeFromEvent(balanceChangedSub)
  }
  balanceChangedSub = goodWallet.balanceChanged(event => onBalanceChange(event, store))
}

export { initTransferEvents, updateAll }
