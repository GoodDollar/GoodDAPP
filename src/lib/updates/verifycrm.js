import API, { getErrorMessage } from '../API'

const fromDate = new Date('2022/05/06')

/**
 * @returns {Promise<void>}
 */
const verifyCRM = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  try {
    const profile = await userStorage.getPrivateProfile()
    const result = await API.verifyCRM(profile)

    log.info('verifyCRM', { result })
  } catch (e) {
    log.warn('verifyCRM error :', getErrorMessage(e), e)
  }
}

export default { fromDate, update: verifyCRM, key: 'verifyCRM' }
