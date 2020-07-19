import Gun from '@gooddollar/gun'
import '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/radix'
import '@gooddollar/gun/lib/radisk'
import '@gooddollar/gun/lib/store'
import '@gooddollar/gun/lib/rindexed'
import './gundb-extend'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
// eslint-disable-next-line no-unused-vars

const initGunDB = () => {
  let gun
  if (!global.gun) {
    if (process.env.NODE_ENV === 'test') {
      gun = Gun()
    } else {
      gun = Gun({
        localStorage: (window && window.RindexedDB) === undefined,
        peers: [Config.gunPublicUrl],
      })
    }
    logger.debug('Initialized gundb', Config.gunPublicUrl)
  }
  global.gun = gun
  return gun
}
export default initGunDB()
