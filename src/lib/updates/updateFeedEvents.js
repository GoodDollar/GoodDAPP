import wallet from '../wallet/GoodWallet'

const fromDate = new Date('2021/07/5')

/**
 * fix broken feed items
 * @returns {Promise<void>}
 */
const updateFeedEvents = async (lastUpdate, prevVersion, log) => {
  log.info('waiting for wallet init')
  await wallet.ready
  log.info('wallet ready, syncing blockchain')
  return wallet.syncTxWithBlockchain(6000000)
}
export default { fromDate, update: updateFeedEvents, key: 'updateFeedEvents' }
