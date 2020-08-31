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

const { gunPublicUrl } = Config
const { RindexedDB } = window || {}
const gunOptions = []

if (process.env.NODE_ENV !== 'test') {
  gunOptions.push({
    localStorage: !RindexedDB,
    peers: [gunPublicUrl],
  })
}

const gun = Gun(...gunOptions)

logger.debug('Initialized gundb', gunPublicUrl)
assign(global, { gun })

export default gun
