import React, { createContext, useCallback, useMemo, useState } from 'react'
import { defaultAccountValue, defaultVerificationState } from '../constants/user'

export const UserContext = createContext()

export const UserContextProvider = props => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoggedInCitizen, setIsLoggedInCitizen] = useState(false)
  const [account, setAccount] = useState(defaultAccountValue)
  const [uploadedAvatar, setUploadedAvatar] = useState()
  const [verification, setVerification] = useState(defaultVerificationState)

  const updateIsLoggedIn = useCallback(value => {
    setIsLoggedIn(value)
  }, [])

  const updateIsLoggedInCitizen = useCallback(value => {
    setIsLoggedInCitizen(value)
  }, [])

  const updateAccountData = useCallback(value => {
    setAccount({ ...account, ...value })
  }, [])

  const updateVerificationData = useCallback(value => {
    setVerification(value)
  }, [])

  const updateUploadedAvatar = useCallback(value => {
    setUploadedAvatar(value)
  }, [])

  const userContextData = useMemo(
    () => ({
      isLoggedIn,
      isLoggedInCitizen,
      account,
      verification,
      uploadedAvatar,
      updateIsLoggedIn,
      updateIsLoggedInCitizen,
      updateAccountData,
      updateUploadedAvatar,
      updateVerificationData,
    }),
    [isLoggedIn, isLoggedInCitizen, account, verification, uploadedAvatar],
  )

  return <UserContext.Provider value={userContextData}>{props.children}</UserContext.Provider>
}
