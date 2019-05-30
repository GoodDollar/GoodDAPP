// @flow
import type { Store } from 'undux'
import logger from '../../logger/pino-logger'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../../gundb/UserStorage'

const log = logger.child({ from: 'undux/utils/balance' })

const updateAll = (store: Store) => {
  return Promise.all([updateBalance(store), updateEntitlement(store)]).then(() =>
    store.set('account')({ ...store.get('account'), ready: true })
  )
}

/**
 * Retrieves account's balance and sets its value to the state
 * @returns {Promise<void>}
 */
const updateBalance = async (store: Store): Promise<void> => {
  try {
    log.info('updating balance')

    const balance = await goodWallet.balanceOf()

    log.debug({ balance })

    store.set('account')({ ...store.get('account'), balance })
  } catch (error) {
    log.error('failed to gather balance value:', { error })
  }
}

/**
 * Retrieves account's entitlement and sets its value to the state
 * @returns {Promise<void>}
 */
const updateEntitlement = async (store: Store): Promise<void> => {
  try {
    log.info('updating entitlement')

    const entitlement = await goodWallet.checkEntitlement().catch(e => 0)

    log.debug({ entitlement })
    store.set('account')({ ...store.get('account'), entitlement })
  } catch (error) {
    log.error('failed to gather entitlement value:', { error })
  }
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

export { initTransferEvents, updateBalance, updateEntitlement, updateAll }
