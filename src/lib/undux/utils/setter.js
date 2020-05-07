// @flow
import { useMemo } from 'react'

export const createUseCurriedSettersHook = getConnectedStore => (paths: string[]) => {
  const store = getConnectedStore().useStore()

  return useMemo(() => paths.map(path => store.set(path)), [paths, store])
}
