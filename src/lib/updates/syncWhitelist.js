import API from '../API'

const fromDate = new Date('2023/04/25')

/**
 * @returns {Promise<void>}
 */
// eslint-disable-next-line require-await
const syncWhitelist = async (lastUpdate, prevVersion, log, { goodWallet }, userStorage) => {
  log.debug('syncwhitelist update')

  const result = await API.syncWhitelist(goodWallet.account)
  log.debug('syncwhitelist update success', { result })
}

export default { fromDate, update: syncWhitelist, key: 'syncWhitelist' }
