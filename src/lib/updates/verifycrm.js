import API, { throwException } from '../API'

const fromDate = new Date('2022/05/06')

/**
 * @returns {Promise<void>}
 */
const verifyCRM = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  try {
    const profile = await userStorage.getPrivateProfile()
    const result = await API.verifyCRM(profile).catch(throwException)

    log.info('verifyCRM', { result })
  } catch (e) {
    log.error('verifyCRM error :', e.message, e)
    throw e
  }
}

export default { fromDate, update: verifyCRM, key: 'verifyCRM' }
