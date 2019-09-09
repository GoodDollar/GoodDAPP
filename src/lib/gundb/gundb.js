import Gun from '@gooddollar/gun-appendonly'
// eslint-disable-next-line no-unused-vars
import SEA from 'gun/sea'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
// eslint-disable-next-line no-unused-vars
import gundbextend from './gundb-extend'

const initGunDB = () => {
  if (!global.gun) {
    if (process.env.NODE_ENV === 'test') {
      global.gun = Gun()
    } else {
      global.gun = Gun([Config.gunPublicUrl])
    }
    logger.debug('Initialized gundb', Config.gunPublicUrl)
  }
  return global.gun
}
export default initGunDB()
