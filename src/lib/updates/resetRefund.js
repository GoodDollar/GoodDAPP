import { REFUNDED_FLAG } from '../../components/refund/hooks/useRefund'

const fromDate = new Date('2022/07/12')

/**
 * @returns {Promise<void>}
 */
const resetRefund = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const { userProperties } = userStorage

  log.debug('ready to reset refund flag, updating user props')

  try {
    await userProperties.set(REFUNDED_FLAG, false)
    log.debug('refund flag have been reset')
  } catch (e) {
    log.error('failed to reset refund flag', e.message, e)
  }
}

export default { fromDate, update: resetRefund, key: 'resetRefund' }
