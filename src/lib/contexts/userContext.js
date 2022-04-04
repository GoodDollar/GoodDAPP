import { isFunction } from 'lodash'
import React, { createContext, useCallback, useMemo, useState } from 'react'
import { defaultUserState } from '../constants/user'

export const UserContext = createContext()

export const UserContextProvider = ({ children }) => {
  const [userState, setUserState] = useState(defaultUserState)

  const update = useCallback(
    value =>
      setUserState(prevValue => {
        const newValue = isFunction(value) ? value(prevValue) : value

        return { ...prevValue, ...newValue }
      }),
    [],
  )

  const reset = useCallback(() => setUserState(defaultUserState), [setUserState])
  const contextValue = useMemo(() => ({ ...userState, update, reset }), [userState, update, reset])

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}
