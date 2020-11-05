import userStorage from '../gundb/UserStorage'
import API from '../API/api'
const fromDate = new Date('2020/10/08')

/**
 * set status to broken send feed
 * @returns {Promise<void>}
 */
const checkProfile = async (lastUpdate, prevVersion, log) => {
  const fullName = await userStorage.getProfileField('fullName')
  userStorage.setProfileField('walletAddress', userStorage.wallet.account, 'public')
  if (!fullName || !fullName.display || !fullName.privacy || !fullName.value) {
    const { data } = await API.userExistsCheck({ identifier: userStorage.wallet.getAccountForType('login') })
    await userStorage.setProfileField('fullName', data.fullName, 'public')
  }
}
export default { fromDate, update: checkProfile, key: 'fixProfile' }
