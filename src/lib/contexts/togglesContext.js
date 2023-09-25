import React, { createContext, useEffect, useState } from 'react'
import { CODEPUSH_CHECKED, IS_LOGGED_IN } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'

export const GlobalTogglesContext = createContext({})
export const GlobalTogglesContextProvider = props => {
  const [isDialogBlurOn, setDialogBlur] = useState(false)
  const [isMenuOn, setMenu] = useState(false)
  const [serviceWorkerUpdated, setServiceWorkerUpdated] = useState()
  const [installPrompt, setInstallPrompt] = useState()
  const [isLoggedInRouter, setLoggedInRouter] = useState() //switch between signup router and logged in router
  const [addWebApp, setAddWebApp] = useState({ showInitial: false, showDialog: false })
  const [isMobileKeyboardShown, setMobileKeyboardShown] = useState()
  const [isMobileSafariKeyboardShown, setMobileSafariKeyboardShown] = useState()
  const [isLoadingIndicator, setLoadingIndicator] = useState()
  const [feedLoadAnimShown, setFeedLoadAnimShown] = useState()
  const [hasSyncedCodePush, setHasSyncedCodePush] = useState(false)

  useEffect(() => {
    if (isLoggedInRouter != null) {
      AsyncStorage.safeSet(IS_LOGGED_IN, isLoggedInRouter)
    }
  }, [isLoggedInRouter])

  useEffect(() => {
    AsyncStorage.getItem(IS_LOGGED_IN).then(_ => setLoggedInRouter(!!_))
  }, [])

  useEffect(() => {
    AsyncStorage.getItem(CODEPUSH_CHECKED).then(_ => setHasSyncedCodePush(_))
  }, [])

  return (
    <GlobalTogglesContext.Provider
      value={{
        isDialogBlurOn,
        isMenuOn,
        serviceWorkerUpdated,
        installPrompt,
        isLoggedInRouter,
        addWebApp,
        isMobileKeyboardShown,
        isMobileSafariKeyboardShown,
        isLoadingIndicator,
        feedLoadAnimShown,
        hasSyncedCodePush,
        setServiceWorkerUpdated,
        setInstallPrompt,
        setDialogBlur,
        setMenu,
        setLoggedInRouter,
        setAddWebApp,
        setMobileKeyboardShown,
        setMobileSafariKeyboardShown,
        setLoadingIndicator,
        setFeedLoadAnimShown,
      }}
    >
      {props.children}
    </GlobalTogglesContext.Provider>
  )
}
