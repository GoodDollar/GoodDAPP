import userStorage from '../gundb/UserStorage'
const fromDate = new Date('2020/02/26')

/**
 * set status to broken send feed
 * @returns {Promise<void>}
 */
const checkAvatar = (lastUpdate, prevVersion, log) => {
  return userStorage.checkSmallAvatar()
}
export default { fromDate, update: checkAvatar, key: 'fixSmallAvatar' }
