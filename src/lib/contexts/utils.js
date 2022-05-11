import { isFunction, noop } from 'lodash'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export const createObjectStorageContext = defaultState => {
  const Context = createContext({
    ...defaultState,
    reset: noop,
    update: noop,
  })

  const useStorage = () => useContext(Context)

  const ContextProvider = ({ children }) => {
    const [storageState, setStorageState] = useState(defaultState)

    const update = useCallback(
      value =>
        setStorageState(prevValue => {
          const newValue = isFunction(value) ? value(prevValue) : value

          return { ...prevValue, ...newValue }
        }),
      [setStorageState],
    )

    const reset = useCallback(() => setStorageState(defaultState), [setStorageState])
    const contextValue = useMemo(() => ({ ...storageState, update, reset }), [storageState, update, reset])

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
  }

  return { Context, useStorage, ContextProvider }
}
