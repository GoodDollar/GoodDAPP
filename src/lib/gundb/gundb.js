import Gun from '@gooddollar/gun'
import '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/radix'
import '@gooddollar/gun/lib/radisk'
import '@gooddollar/gun/lib/store'
import '@gooddollar/gun/lib/rindexed'
import '@gooddollar/gun/nts'

import { assign } from 'lodash'

import './gundb-extend'
import Config from '../../config/config'
import logger from '../logger/pino-logger'

const { gunPublicUrl, forcePeer } = Config
const { RindexedDB } = window || {}
const gunOptions = []
const peers = gunPublicUrl.split(',')
let peer = peers.length > 1 && Math.random() <= 0.1 ? peers[1] : peers[0]
if (forcePeer) {
  peer = peers[1]
}
if (process.env.NODE_ENV !== 'test') {
  gunOptions.push({
    localStorage: !RindexedDB,
    peers: [peer],
  })
}

const gun = Gun(...gunOptions)

logger.debug('Initialized gundb', { gunOptions })
assign(global, { gun })

export default gun
