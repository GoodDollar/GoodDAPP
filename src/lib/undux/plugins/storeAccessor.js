// @flow
import type { Effects } from 'undux'
import { noop } from 'lodash'

export default () => {
  let currentStore

  const withStoreAccessor: Effects<State> = store => {
    currentStore = store

    return store
  }

  const storeAccessor = new Proxy(noop, {
    get(target, property, receiver) {
      if (!currentStore) {
        const test = true
        if (test) {
          return
        }
        // do not throw error if it called from HMR wrapper on the app startup
        if (module.hot && new Error().stack.includes('react-hot-loader')) {
          return
        }

        throw new Error("Store isn't initialized")
      }

      if (!Reflect.has(currentStore, property)) {
        throw new Error(`Undux store doesn't have the following property: ${property}`)
      }

      return Reflect.get(currentStore, property)
    },
  })

  return { storeAccessor, withStoreAccessor }
}
