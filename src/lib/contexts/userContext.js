import React, { createContext, useCallback, useState } from 'react'
import { defaultUserState } from '../constants/user'

export const UserContext = createContext()

export const UserContextProvider = props => {
  const [userState, setUserState] = useState(defaultUserState)

  const update = useCallback(value => {
    setUserState(prev => ({ ...prev, ...value }))
  }, [])

  const reset = useCallback(() => {
    setUserState(defaultUserState)
  }, [])

  return <UserContext.Provider value={{ ...userState, update, reset }}>{props.children}</UserContext.Provider>
}
