import { withReduxDevtools } from 'undux'
import { compose } from 'lodash/fp'
import { appEnv } from '../../utils/env'
import withPinoLogger from './logger'
import createStoreAccessor from './storeAccessor'

export { log as unduxLogger } from './logger'

export default () => {
  const { storeAccessor, withStoreAccessor } = createStoreAccessor()

  return {
    storeAccessor,
    storeEffects: compose(
      withPinoLogger,
      withStoreAccessor,
      appEnv && withReduxDevtools,
    ),
  }
}
