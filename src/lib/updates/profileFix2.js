import { keys } from 'lodash'
import userStorage from '../gundb/UserStorage'
import API from '../API/api'
import { timeout } from '../utils/async'

const fromDate = new Date('2020/12/13')

/**
 * fix missing decryption keys
 * @returns {Promise<void>}
 */
const checkProfile = async (lastUpdate, prevVersion, log) => {
  //reset all bad profile fields
  const ps = keys(userStorage.profileSettings).map(field => {
    return userStorage.profile
      .get(field)
      .get('value')
      .decrypt()
      .catch(e => {
        if (e.message === 'Decrypting key missing') {
          return userStorage.setProfileField(field, '', userStorage.profileSettings[field].defaultPrivacy)
        }
      })
  })

  await Promise.race([Promise.all(ps), timeout(10000, 'fixProfile2 timeout')])

  const fullName = await userStorage.getProfileFieldValue('fullName').catch(e => false)
  userStorage.setProfileField('walletAddress', userStorage.wallet.account, 'public')
  if (!fullName || !fullName.display || !fullName.privacy || !fullName.value) {
    const { data } = await API.userExistsCheck({ identifier: userStorage.wallet.getAccountForType('login') })
    data.fullName && (await userStorage.setProfileField('fullName', data.fullName, 'public'))
  }
}
export default { fromDate, update: checkProfile, key: 'fixProfile2' }
