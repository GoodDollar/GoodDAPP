import { isFunction } from 'lodash'
import React, { createContext, useEffect, useState } from 'react'
import { useCurriedSetters } from '../undux/SimpleStore'

export const GlobalTogglesContext = createContext()

export const setDialogBlur = (store, state) => {
  const setDialogBlur = store.get('setDialogBlur')

  if (isFunction(setDialogBlur)) {
    setDialogBlur(state)
  }
}

export const GlobalTogglesContextProvider = props => {
  const [isDialogBlurOn, setDialogBlur] = useState(false)
  const [isMenuOn, setMenu] = useState(false)
  const [setDialogBlurStoreRef] = useCurriedSetters(['setDialogBlur'])

  useEffect(() => void setDialogBlurStoreRef(setDialogBlur), [setDialogBlurStoreRef, setDialogBlur])

  return (
    <GlobalTogglesContext.Provider value={{ isDialogBlurOn, isMenuOn, setDialogBlur, setMenu }}>
      {props.children}
    </GlobalTogglesContext.Provider>
  )
}
