import Gun from 'gun'
import 'gun/sea'
import './gundb-extend'
import '@gooddollar/gun-asyncstorage'

import Config from '../../config/config'
import env from '../../config/env'
import logger from '../logger/pino-logger'
// eslint-disable-next-line no-unused-vars

const initGunDB = () => {
  let gun
  if (!global.gun) {
    if (env.NODE_ENV === 'test') {
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
