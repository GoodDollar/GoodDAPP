import React, { createContext } from 'react'
import GDStore from '../undux/GDStore'
import SimpleStore from '../undux/SimpleStore'

export const UserContext = createContext()

export const UserContextProvider = props => {
  const gdstore = GDStore.useStore()
  const store = SimpleStore.useStore()

  const account = gdstore.get('account')
  const inviteCode = gdstore.get('inviteCode')
  const invitesData = gdstore.get('invitesData')
  const uploadedAvatar = gdstore.get('uploadedAvatar')

  const isLoggedIn = store.get('isLoggedIn')
  const isLoggedInCitizen = store.get('isLoggedInCitizen')

  const profileData = {
    invitesData,
    uploadedAvatar,
    account,
    inviteCode,
    isLoggedIn,
    isLoggedInCitizen,
  }

  return <UserContext.Provider value={{ ...profileData }}>{props.children}</UserContext.Provider>
}
