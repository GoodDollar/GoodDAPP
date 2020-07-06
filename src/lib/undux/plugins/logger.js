// @flow
import type { Effects } from 'undux'

import logger from '../../logger/pino-logger'
import type { State } from '../GDStore'

export const log = logger.child({ from: 'undux' })

const complexObjects = ['wallet', 'userStorage']

const withPinoLogger: Effects<State> = store => {
  store.onAll().subscribe(({ key, previousValue, value }) => {
    log.info('store content changed', {
      key,
      from: complexObjects.includes(key) ? Boolean(previousValue) : previousValue,
      to: complexObjects.includes(key) ? Boolean(value) : value,
    })
  })

  return store
}

export default withPinoLogger
