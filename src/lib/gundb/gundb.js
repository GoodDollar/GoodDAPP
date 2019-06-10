import Gun from '@gooddollar/gun-appendonly'
import SEA from 'gun/sea'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import gundbextend from './gundb-extend'

const initGunDB = () => {
  if (!global.gun) {
    if (process.env.NODE_ENV === 'test') global.gun = Gun()
    else global.gun = Gun([Config.gunPublicUrl])
    logger.debug('Initialized gundb')
  }
  return global.gun
}
export default initGunDB()
