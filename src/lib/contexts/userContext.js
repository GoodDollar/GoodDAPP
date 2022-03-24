import React, { createContext, useCallback, useRef } from 'react'
import { defaultAccountValue } from '../constants/user'

export const UserContext = createContext()

export const UserContextProvider = props => {
  const isLoggedIn = useRef(false)
  const isLoggedInCitizen = useRef(false)
  const account = useRef(defaultAccountValue)
  const invitesData = useRef({})

  const updateIsLoggedIn = useCallback(value => {
    isLoggedIn.current = value
  }, [])

  const updateIsLoggedInCitizen = useCallback(value => {
    isLoggedInCitizen.current = value
  }, [])

  const setAccountData = useCallback(value => {
    account.current = value
  }, [])

  const setInvitesData = useCallback(value => {
    invitesData.current = value
  }, [])

  const userContextData = {
    isLoggedIn,
    isLoggedInCitizen,
    account,
    invitesData,
    updateIsLoggedIn,
    updateIsLoggedInCitizen,
    setAccountData,
    setInvitesData,
  }

  return <UserContext.Provider value={userContextData}>{props.children}</UserContext.Provider>
}
