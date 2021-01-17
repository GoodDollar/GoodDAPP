import userStorage from '../gundb/UserStorage'
import API from '../API/api'
import { timeout } from '../utils/async'

const fromDate = new Date('2021/01/17')

/**
 * fix missing decryption keys
 * @returns {Promise<void>}
 */
const checkProfile = async (lastUpdate, prevVersion, log) => {
  const fields = Object.keys(userStorage.profileSettings)
  const { account: walletAddress } = userStorage.wallet

  log.debug('check profile', { lastUpdate, prevVersion, fields })

  await userStorage
    .setProfileField('walletAddress', walletAddress, 'public')
    .then(() => log.debug('walletAddress updated', { walletAddress }))
    .catch(e => {
      log.error('walletAddress update failed', e.message, e)
      throw e
    })

  const fullName = await userStorage.getProfileFieldValue('fullName').catch(_ => false)

  if (!fullName || !fullName.display || !fullName.privacy || !fullName.value) {
    log.debug('fullName check failed', { fullName })

    const { data } = await API.userExistsCheck({ identifier: userStorage.wallet.getAccountForType('login') }).catch(
      e => {
        log.error('failed getting fullName from API call', e.message, e)
        throw e
      },
    )

    if (data && data.fullName) {
      await userStorage
        .setProfileField('fullName', data.fullName, 'public')
        .then(() => log.debug('fullName updated', { fullName: data.fullName }))
        .catch(e => {
          log.error('fullName update failed', e.message, e)
          throw e
        })
    } else {
      log.debug('received empty fullName from API call', { data })
    }
  }

  // reset all bad profile fields
  const ps = fields.map(field =>
    userStorage.profile
      .get(field)
      .get('value')
      .decrypt()
      .catch(e => {
        if (e.message === 'Decrypting key missing') {
          log.debug('broken field found, resetting', { field })

          return userStorage.setProfileField(field, '', userStorage.profileSettings[field].defaultPrivacy)
        }
      }),
  )

  await Promise.race([Promise.all(ps), timeout(15000, 'fixProfile timeout')])
    .then(() => log.debug('profile fields checked'))
    .catch(e => {
      log.error('profile fields check failed', e.message, e)
      throw e
    })
}

export default { fromDate, update: checkProfile, key: 'fixProfile' }
