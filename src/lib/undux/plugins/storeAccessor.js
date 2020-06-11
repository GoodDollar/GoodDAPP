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
