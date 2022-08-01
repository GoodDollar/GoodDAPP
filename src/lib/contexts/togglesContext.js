import { omit } from 'lodash'
import React, { createContext, useCallback, useEffect, useState } from 'react'
import { IS_LOGGED_IN } from '../constants/localStorage'
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
  const [cache, updateCache] = useState({})

  const hasCache = useCallback(key => key in cache, [cache])
  const setCache = useCallback((key, value) => updateCache(cache => ({ ...cache, [key]: value })), [updateCache])
  const clearCache = useCallback((key = null) => updateCache(cache => (key ? omit(cache, key) : {})), [updateCache])

  useEffect(() => {
    if (isLoggedInRouter != null) {
      AsyncStorage.safeSet(IS_LOGGED_IN, isLoggedInRouter)
    }
  }, [isLoggedInRouter])

  useEffect(() => {
    AsyncStorage.getItem(IS_LOGGED_IN).then(_ => setLoggedInRouter(!!_))
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
        cache,
        hasCache,
        setCache,
        clearCache,
      }}
    >
      {props.children}
    </GlobalTogglesContext.Provider>
  )
}
