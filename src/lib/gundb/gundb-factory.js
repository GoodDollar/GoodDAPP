import Gun from '@gooddollar/gun'

import '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/radix'
import '@gooddollar/gun/lib/radisk'
import '@gooddollar/gun/lib/store'
import '@gooddollar/gun/lib/rindexed'

// import '@gooddollar/gun/nts'

import { assign, findLastIndex } from 'lodash'

import './gundb-extend'
import Config from '../../config/config'
import logger from '../logger/js-logger'

export default function createGun(options = {}) {
  const { gunPublicUrl, nodeEnv, peersProb, forcePeer } = Config
  const gunOptions = []

  const peers = gunPublicUrl.split(',')
  const prob = Math.random()
  const peerIndex = findLastIndex(peersProb, x => x >= prob)
  let peer = peers[peerIndex] || peers[0]
  if (forcePeer) {
    peer = peers[forcePeer]
  }

  if (nodeEnv !== 'test') {
    gunOptions.push({
      ...options,
      peers: [peer],
    })
  }

  const gun = Gun(...gunOptions)

  logger.debug('Initialized gundb', { gunOptions })
  assign(global, { gun })

  return gun
}
