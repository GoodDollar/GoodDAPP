import React, { createContext, useState } from 'react'

export const GlobalTogglesContext = createContext({})
export const GlobalTogglesContextProvider = props => {
  const [isDialogBlurOn, setDialogBlur] = useState(false)
  const [isMenuOn, setMenu] = useState(false)
  const [serviceWorkerUpdated, setServiceWorkerUpdated] = useState()
  const [installPrompt, setInstallPrompt] = useState()

  return (
    <GlobalTogglesContext.Provider
      value={{
        isDialogBlurOn,
        isMenuOn,
        serviceWorkerUpdated,
        installPrompt,
        setServiceWorkerUpdated,
        setInstallPrompt,
        setDialogBlur,
        setMenu,
      }}
    >
      {props.children}
    </GlobalTogglesContext.Provider>
  )
}
