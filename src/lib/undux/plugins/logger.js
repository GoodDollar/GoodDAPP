// @flow
import type { Effects } from 'undux'

import logger from '../../logger/js-logger'
import type { State } from '../GDStore'

export const log = logger.child({ from: 'undux' })

const withPinoLogger: Effects<State> = store => {
  store.onAll().subscribe(({ key, previousValue, value }) => {
    log.info('changed', key, 'from', previousValue, 'to', value)
  })

  return store
}

export default withPinoLogger
