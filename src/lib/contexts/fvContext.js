import { isFunction } from 'lodash'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export const defaultVerificationState = {
  attemptsCount: 0,
  attemptsHistory: [],
  reachedMaxAttempts: false,
}

export const FVContext = createContext()

export const FVContextProvider = ({ children }) => {
  const [fvState, setFVState] = useState(defaultVerificationState)

  const update = useCallback(
    value =>
      setFVState(prevValue => {
        const newValue = isFunction(value) ? value(prevValue) : value

        return { ...prevValue, ...newValue }
      }),
    [setFVState],
  )

  const reset = useCallback(() => setFVState(defaultVerificationState), [setFVState])
  const contextValue = useMemo(() => ({ ...fvState, update, reset }), [fvState, update, reset])

  return <FVContext.Provider value={contextValue}>{children}</FVContext.Provider>
}

export const useFVContext = () => useContext(FVContext)
