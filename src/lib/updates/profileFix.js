import { Platform } from 'react-native'
import userStorage from '../gundb/UserStorage'
import API from '../API/api'
import { retry, timeout } from '../utils/async'

const fromDate = new Date('2021/05/25')

const flushTimeout = Platform.select({
  web: 2500,
  native: 30000, // set 30sec timeout on mobile
})

/**
 * fix missing decryption keys
 * @returns {Promise<void>}
 */
const checkProfile = async (lastUpdate, prevVersion, log) => {
  const fields = ['walletAddress', 'email', 'mobile']
  const { account: walletAddress } = userStorage.wallet

  const flushField = field =>
    userStorage.profile
      .get(field)
      .get('value')
      .decrypt()
      .then(() => log.debug('decrypted'))
      .catch(e => {
        log.debug('decrypt error', e)
        if (e.message === 'Decrypting key missing') {
          log.debug('broken field found, resetting', { field })

          return userStorage.setProfileField(field, '', userStorage.profileSettings[field].defaultPrivacy)
        }
      })

  const flushWithRetry = field =>
    retry(
      () =>
        Promise.race([
          // set retry & timeout for each field separately
          flushField(field),
          timeout(flushTimeout, `fixProfile: '${field}' field flush timeout`),
        ])
          .then(_ => true)
          .catch(e => e.message),
      2,
    )

  log.debug('check profile', { lastUpdate, prevVersion, fields })

  // reset all bad profile fields
  const aggregatedPromise = Promise.all(fields.map(flushWithRetry))

  await aggregatedPromise
    .then(res => {
      log.debug('profile fields checked')
      const errors = res.filter(_ => _ !== true)
      if (errors.length) {
        throw new Error(errors.join(', '))
      }
    })
    .catch(e => {
      log.error('profile fields check failed', e.message, e)
      throw e
    })

  await userStorage
    .setProfileField('walletAddress', walletAddress, 'public')
    .then(() => log.debug('walletAddress updated', { walletAddress }))
    .catch(e => {
      log.error('walletAddress update failed', e.message, e)
      throw e
    })

  const fullName = await userStorage.getProfileField('fullName').catch(_ => false)

  if (fullName && fullName.display && fullName.privacy && fullName.value) {
    return
  }

  log.debug('fullName check failed', { fullName })

  const { data } = await API.userExistsCheck({ identifier: userStorage.wallet.getAccountForType('login') }).catch(e => {
    log.error('failed getting fullName from API call', e.message, e)
    throw e
  })

  if (!data || !data.fullName) {
    const e = new Error('Received empty fullName from API call')

    log.error('fullName update failed', e.message, e, { data })
    return
  }

  await userStorage
    .setProfileField('fullName', data.fullName, 'public')
    .then(() => log.debug('fullName updated', { fullName: data.fullName }))
    .catch(e => {
      log.error('fullName update failed', e.message, e)
      throw e
    })
}

export default { fromDate, update: checkProfile, key: 'fixProfile' }
