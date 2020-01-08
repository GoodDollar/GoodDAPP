import Gun from 'gun/gun'
import 'gun/sea'
import 'gun-asyncstorage'
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
        peers: [Config.gunPublicUrl],
      })
    }
    logger.debug('Initialized gundb', Config.gunPublicUrl)
  }
  global.gun = gun
  return gun
}

export default initGunDB()
