import { useCallback, useMemo, useRef } from 'react'
import { isPlainObject } from 'lodash'

export default (store, subState) => {
  const setStateInStore = useMemo(() => store.set(subState), [store])
  const storeState = store.get(subState)
  const localStateRef = useRef(storeState)

  const getLocalState = useCallback(() => localStateRef.current, [])

  const updateState = useCallback(
    (nameOrVars, value = null) => {
      const stateVars = isPlainObject(nameOrVars) ? nameOrVars : { [nameOrVars]: value }
      const updatedState = { ...localStateRef.current, ...stateVars }

      localStateRef.current = updatedState
      setStateInStore(updatedState)
    },
    [setStateInStore],
  )

  return [getLocalState, updateState, storeState, localStateRef]
}
