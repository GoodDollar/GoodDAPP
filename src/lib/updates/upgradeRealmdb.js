import userStorage from '../userStorage/UserStorage'

const fromDate = new Date('2021/07/04')

/**
 * fix broken feed items
 * @returns {Promise<void>}
 */
const upgradeRealmDB = async (lastUpdate, prevVersion, log) => {
  await userStorage.ready
  await userStorage.wallet.ready
  await userStorage.feedDB._syncFromLocalStorage()
}
export default { fromDate, update: upgradeRealmDB, key: 'upgradeRealmDB' }
