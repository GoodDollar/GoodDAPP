import Gun from '@gooddollar/gun'

import asyncStore from '@gooddollar/gun/lib/ras.js'
import AsyncStorage from '../utils/asyncStorage'

import '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/radix'
import '@gooddollar/gun/lib/radisk'
import '@gooddollar/gun/lib/store'
import '@gooddollar/gun/lib/rindexed'
import '@gooddollar/gun/nts'

import './gundb-extend'
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
