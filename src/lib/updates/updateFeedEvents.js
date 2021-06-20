// import { get } from 'lodash'
import Config from '../../config/config'

// import userStorage from '../gundb/UserStorage'
import wallet from '../wallet/GoodWallet'

const { feedMigrationBlock, feedMigrationDate } = Config

const fromDate = new Date(feedMigrationDate)

/**
 * fix broken feed items
 * @returns {Promise<void>}
 */
const updateFeedEvents = async (lastUpdate, prevVersion, log) => {
  log.info('waiting for wallet init')
  await wallet.ready
  log.info('wallet ready, syncing blockchain')
  await wallet.syncTxWithBlockchain(feedMigrationBlock)
  log.info('syncing wallet done')
  return
}
export default { fromDate, update: updateFeedEvents, key: 'updateFeedEvents' }
