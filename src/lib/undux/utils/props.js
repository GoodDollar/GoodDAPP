// @flow
import { useMemo } from 'react'

const useCurriedSetters = (store, props) => useMemo(() => props.map(path => store.set(path)), [props, store])

export const createUseCurriedSettersHook = getConnectedStore => (props: string[]) => {
  const store = getConnectedStore().useStore()

  return useCurriedSetters(store, props)
}

export const createUseStorePropHook = getConnectedStore => prop => {
  const store = getConnectedStore().useStore()
  const [setProperty] = useCurriedSetters(store)

  return [store.get(prop), setProperty]
}
