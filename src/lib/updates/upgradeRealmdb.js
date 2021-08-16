import SEA from '@gooddollar/gun/sea'
import userStorage from '../userStorage/UserStorage'
const fromDate = new Date('2021/07/06')

/**
 * import feed and properties from gundb to realmdb
 * @returns {Promise<void>}
 */
const upgradeRealmDB = async (lastUpdate, prevVersion, log) => {
  await userStorage.ready
  await userStorage.initGun()
  const pubkey = userStorage.gunuser.pair().pub
  let done = 0
  const promise = new Promise((res, rej) => {
    userStorage.gunuser
      .get('trust')
      .get(pubkey)
      .then(keys => {
        userStorage.gunuser
          .get('feed')
          .get('byid')
          .on(async data => {
            delete data._
            await setFeedItems(data, keys, log).catch(e => rej(e))
            done += 1
            if (done === 2) {
              res()
            }
          })

        userStorage.gunuser.get('properties').on(async data => {
          await setProperties(data, keys, log).catch(e => rej(e))
          done += 1
          if (done === 2) {
            res()
          }
        })
      }, 3000)
  })
  await promise
  log.info('done upgradeRealmdb')
}

const setFeedItems = (data, keys, log) => {
  const pubkey = userStorage.gunuser.pair().pub
  const promisses = Object.entries(data).map(async ([k, v]) => {
    const encryptedKey = keys[k + 'byidfeed~' + pubkey]
    let decrypted
    try {
      const secureKey = await SEA.decrypt(encryptedKey, userStorage.gunuser.pair())
      decrypted = await SEA.decrypt(v, secureKey)
      decrypted._id = decrypted.id
      decrypted.date = new Date(decrypted.date).toISOString()
      decrypted.createdDate = new Date(decrypted.createdDate).toISOString()
      return userStorage.feedDB.write(decrypted)
    } catch (e) {
      log.warn('unable to decrypt feed item:', e.message, e, { k, v, decrypted })
    }
  })
  return Promise.all(promisses)
}

const setProperties = async (data, keys, log) => {
  const pubkey = userStorage.gunuser.pair().pub

  const encryptedKey = keys['properties~' + pubkey]
  let decrypted
  try {
    const secureKey = await SEA.decrypt(encryptedKey, userStorage.gunuser.pair())
    decrypted = await SEA.decrypt(data, secureKey)
    console.info('found settings', { decrypted })
    return userStorage.feedDB.encryptSettings(decrypted)
  } catch (e) {
    log.warn('unable to decrypt properties:', e.message, e, { data, decrypted })
  }
}

export default { fromDate, update: upgradeRealmDB, key: 'upgradeRealmDB' }
