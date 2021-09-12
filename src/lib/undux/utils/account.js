// @flow
import type { Store } from 'undux'
import logger from '../../logger/js-logger'
import { ExceptionCategory } from '../../logger/exceptions'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../../userStorage/UserStorage'
import { assertStore } from '../SimpleStore'

let subscribed = false
const log = logger.child({ from: 'undux/utils/account' })

export const updateAll = async store => {
  let walletOperations

  try {
    walletOperations = await Promise.all([goodWallet.balanceOf(), goodWallet.checkEntitlement()])
  } catch (exception) {
    const { message } = exception

    log.error('update balance and entitlement failed', message, exception, { category: ExceptionCategory.Blockhain })

    return
  }

  if (!assertStore(store, log, 'updateAll failed')) {
    return
  }

  try {
    const [balance, entitlement] = walletOperations
    const account = store.get('account')
    const balanceChanged = !account.balance || account.balance !== balance
    const entitlementChanged = !account.entitlement || account.entitlement !== entitlement

    if (balanceChanged || entitlementChanged || account.ready === false) {
      store.set('account')({ balance, entitlement, ready: true })
    }
    log.debug('updateAll done', { balance, entitlement })
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
  await updateAll(store)
}

/**
 * Starts listening to Transfer events to (and from) the current account
 */
export const initTransferEvents = (store: Store) => {
  const lastBlock = userStorage.userProperties.get('lastBlock') || 6400000
  log.debug('starting events listener', { lastBlock, subscribed })

  if (subscribed) {
    return
  }

  goodWallet.watchEvents(parseInt(lastBlock), toBlock => userStorage.userProperties.set('lastBlock', parseInt(toBlock)))

  goodWallet.balanceChanged(event => onBalanceChange(event, store))
  subscribed = true
}
