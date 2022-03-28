import React, { createContext, useCallback, useState } from 'react'
import { defaultUserState } from '../constants/user'

export const UserContext = createContext()

export const UserContextProvider = props => {
  const [userState, setUserState] = useState(defaultUserState)

  const updateUserState = useCallback(value => {
    setUserState(prev => ({ ...prev, ...value }))
  }, [])

  const resetUserContext = useCallback(value => {
    setUserState(defaultUserState)
  }, [])

  return (
    <UserContext.Provider value={{ userState, updateUserState, resetUserContext }}>
      {props.children}
    </UserContext.Provider>
  )
}
