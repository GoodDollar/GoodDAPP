/* eslint require-await: "off" */
import SEA from '@gooddollar/gun/sea'
import userStorage from '../userStorage/UserStorage'
import { gunPublicKeyTrust, processGunNode } from './utils'

const fromDate = new Date('2021/07/06')

/**
 * import feed and properties from gundb to realmdb
 * @returns {Promise<void>}
 */
const upgradeRealmDB = async (lastUpdate, prevVersion, log) => {
  await userStorage.ready
  await userStorage.initGun()

  const { gunuser } = userStorage
  const keys = await gunPublicKeyTrust()

  await Promise.all([
    processGunNode(gunuser.get('feed').get('byid'), async data => {
      delete data._
      await setFeedItems(data, keys, log)
    }),

    processGunNode(gunuser.get('properties'), async data => {
      await setProperties(data, keys, log)
    }),
  ])

  log.info('done upgradeRealmdb')
}

const setFeedItems = (data, keys, log) => {
  const pubkey = userStorage.gunuser.pair().pub

  const promisses = Object.entries(data).map(async ([k, v]) => {
    let decrypted
    const encryptedKey = keys[k + 'byidfeed~' + pubkey]

    try {
      const secureKey = await SEA.decrypt(encryptedKey, userStorage.gunuser.pair())

      decrypted = await SEA.decrypt(v, secureKey)
      decrypted._id = decrypted.id
      decrypted.date = new Date(decrypted.date).toISOString()
      decrypted.createdDate = new Date(decrypted.createdDate).toISOString()

      return userStorage.database.write(decrypted)
    } catch (e) {
      log.warn('unable to decrypt feed item:', e.message, e, { k, v, decrypted })
    }
  })

  return Promise.all(promisses)
}

const setProperties = async (data, keys, log) => {
  let decrypted
  const pubkey = userStorage.gunuser.pair().pub
  const encryptedKey = keys['properties~' + pubkey]

  try {
    const secureKey = await SEA.decrypt(encryptedKey, userStorage.gunuser.pair())

    decrypted = await SEA.decrypt(data, secureKey)
    console.info('found settings', { decrypted })

    return userStorage.database.encryptSettings(decrypted)
  } catch (e) {
    log.warn('unable to decrypt properties:', e.message, e, { data, decrypted })
  }
}

export default { fromDate, update: upgradeRealmDB, key: 'upgradeRealmDB' }
