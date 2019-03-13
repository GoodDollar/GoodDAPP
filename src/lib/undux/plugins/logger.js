// @flow
import type { Effects } from 'undux'

import logger from '../../logger/pino-logger'
import type { State } from '../GDStore'

const log = logger.child({ from: 'undux' })

const withPinoLogger: Effects<State> = store => {
  store.onAll().subscribe(({ key, previousValue, value }) => {
    if (typeof previousValue === 'object') {
      log.info('changed', key, 'to', value)
    } else {
      log.info('changed', key, 'from', previousValue, 'to', value)
    }
  })

  return store
}

export default withPinoLogger
