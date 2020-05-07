// @flow
import { useMemo } from 'react'

export const createUseCurriedSettersHook = ConnectedStore => (paths: string[]) => {
  const store = ConnectedStore.useStore()

  return useMemo(() => paths.map(path => store.set(path)), [paths, store])
}
