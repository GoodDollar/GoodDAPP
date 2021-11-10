import React, { createContext, useState } from 'react'

export const GlobalTogglesContext = createContext()
export const GlobalTogglesContextProvider = props => {
  const [isDialogBlurOn, setDialogBlur] = useState(false)
  const [isMenuOn, setMenu] = useState(false)

  return (
    <GlobalTogglesContext.Provider value={{ isDialogBlurOn, isMenuOn, setDialogBlur, setMenu }}>
      {props.children}
    </GlobalTogglesContext.Provider>
  )
}
