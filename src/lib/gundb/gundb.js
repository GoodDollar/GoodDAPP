import Gun from 'gun'
import SEA from 'gun/sea'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import gundbextend from './gundb-extend'

const initGunDB = () => {
  if (!global.gun) {
    global.gun = Gun([Config.serverUrl + '/gun'])
    logger.debug('Initialized gundb')
  }
}

export default initGunDB()
