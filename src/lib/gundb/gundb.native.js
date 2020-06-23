import { AsyncStorage } from 'react-native'
import Gun from 'gun/gun'
import 'gun/sea'
import './gundb-extend'
import 'gun/lib/radix.js'
import 'gun/lib/radisk.js'
import 'gun/lib/store.js'
import asyncStore from 'gun/lib/ras.js'
import Config from '../../config/config'
import logger from '../logger/pino-logger'

// eslint-disable-next-line no-unused-vars

const initGunDB = () => {
  let gun
  if (!global.gun) {
    if (Config.nodeEnv === 'test') {
      gun = Gun()
    } else {
      gun = Gun({
        rfs: false,

        // Warning: Android AsyncStorage has 6mb limit by default!
        store: asyncStore({ AsyncStorage }),
        peers: [Config.gunPublicUrl],
      })
    }
    logger.debug('Initialized gundb', Config.gunPublicUrl)
  }
  global.gun = gun
  return gun
}

export default initGunDB()
