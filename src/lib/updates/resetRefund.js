import { REFUNDED_FLAG } from '../../components/refund/hooks/useRefund'

const fromDate = new Date('2022/07/13')

/**
 * @returns {Promise<void>}
 */
// eslint-disable-next-line require-await
const resetRefund = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const { userProperties } = userStorage

  log.debug('ready to reset refund flag, updating user props')

  userProperties.setLocal(REFUNDED_FLAG, false)
  log.debug('refund flag have been reset')
}

export default { fromDate, update: resetRefund, key: 'resetRefund' }
