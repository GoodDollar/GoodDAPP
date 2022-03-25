import React, { createContext, useCallback, useState } from 'react'
import { defaultUserState } from '../constants/user'

export const UserContext = createContext()

export const UserContextProvider = props => {
  const [userState, setUserState] = useState(defaultUserState)

  const updateUserState = useCallback(value => {
    setUserState({ ...userState, ...value })
  }, [])

  return <UserContext.Provider value={{ userState, updateUserState }}>{props.children}</UserContext.Provider>
}
