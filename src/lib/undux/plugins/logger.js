// @flow
import type { Effects } from 'undux'
// TODO: this line must be changed to point to the actual store once it's created
import type { State } from '../GDStore'
import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'undux' })

const withPinoLogger: Effects<State> = store => {
  store
    .onAll()
    .subscribe(({ key, previousValue, value }) => log.info('changed', key, 'from', previousValue, 'to', value))
  return store
}

export default withPinoLogger
