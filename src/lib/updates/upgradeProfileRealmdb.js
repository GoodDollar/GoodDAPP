import SEA from '@gooddollar/gun/sea'
import userStorage from '../userStorage/UserStorage'
const fromDate = new Date('2021/08/16')

/**
 * import feed and properties from gundb to realmdb
 * @returns {Promise<void>}
 */
const upgradeProfileRealmDB = async (lastUpdate, prevVersion, log) => {
  await userStorage.ready
  await userStorage.initGun()
  const pubkey = userStorage.gunuser.pair().pub
  const promise = new Promise((res, rej) => {
    userStorage.gunuser
      .get('trust')
      .get(pubkey)
      .then(keys => {
        userStorage.gunuser.get('profile').on(async data => {
          delete data._
          await setProfile(data, keys, log).catch(e => rej(e))
          res()
        })
      }, 3000)
  })
  await promise
  log.info('done upgradeProfileRealmdb')
}

const setProfile = async (data, keys, log) => {
  const pubkey = userStorage.gunuser.pair().pub
  log.debug('setProfile:', { data })
  const profile = {}
  const promisses = Object.entries(data).map(async ([k, v]) => {
    if (!v['#']) {
      return
    }
    const data = await userStorage.gun.get(v['#']).then(null, 1000)
    let decrypted
    try {
      const value = data.value
      const path = 'value' + k + 'profile~' + pubkey
      const encryptedKey = keys[path]
      log.debug('setProfile: field', { data, k, value, encryptedKey, path })
      const secureKey = await SEA.decrypt(encryptedKey, userStorage.gunuser.pair())
      decrypted = await SEA.decrypt(value, secureKey)
      profile[k] = decrypted
    } catch (e) {
      log.warn('unable to decrypt profile field item:', e.message, e, { k, v, data, decrypted })
    }
  })
  await Promise.all(promisses)
  log.info('saving profile', { profile })
  return userStorage.profileStorage.setProfile(profile)
}

export default { fromDate, update: upgradeProfileRealmDB, key: 'upgradeProfileRealmDB' }
