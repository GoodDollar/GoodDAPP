import API from '../API/api'
const fromDate = new Date('2022/03/27')

/**
 * @returns {Promise<void>}
 */
const verifyCRM = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const profile = await userStorage.getPrivateProfile()
  const result = await API.verifyCRM(profile)
  log.info('verifyCRM', { result })
}

export default { fromDate, update: verifyCRM, key: 'verifyCRM' }
