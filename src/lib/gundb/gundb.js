import Gun from 'gun'
import SEA from 'gun/sea'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import gundbdecrypt from './gundb-decrypt'

const initGunDB = () => {
  if (!global.gun) {
    global.gun = Gun([Config.GoodServer + '/gun'])
    logger.debug('Initialized gundb')
  }
}

export default initGunDB
