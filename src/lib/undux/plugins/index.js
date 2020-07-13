import { compose } from 'lodash/fp'
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
    ),
  }
}
