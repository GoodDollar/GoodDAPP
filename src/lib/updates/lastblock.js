import userStorage from '../gundb/UserStorage'
const fromDate = new Date('2020/07/13')

/**
 * set status to broken send feed
 * @returns {Promise<void>}
 */
const setLastBlock = async (lastUpdate, prevVersion, log) => {
  const lastBlock = (await userStorage.feed.get('lastBlock').then(null, 1000)) || 0
  log.debug('updating lastBlock:', { lastBlock })
  userStorage.userProperties.set('lastBlock', lastBlock)
}
export default { fromDate, update: setLastBlock, key: 'fixLastBlock' }
