import { get } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'

import Config from '../../../config/config'

const AuthContext = React.createContext({
  success: false,
  preparing: false,
  successCallback: null,
  signedUpProvider: null,
  alreadySignedUp: false,
  torusInitialized: false,
  handleLoginMethod: null,
  successDelay: Config.authSuccessDelay,
  setWalletPreparing: isPreparing => {},
  setAlreadySignedUp: (withProvider, options, onDecision = null) => {},
  setSuccessfull: (callback = null, delay = null) => {},
  setTorusInitialized: handleLoginMethod => {},
})

export const AuthContextProvider = ({ children }) => {
  const [preparing, setWalletPreparing] = useState(false)
  const [successState, setSuccessState] = useState(null)
  const [existingState, setExistingState] = useState(null)
  const [torusOptions, setTorusOptions] = useState(null)

  const [success, alreadySignedUp] = useMemo(() => [successState, existingState].map(Boolean), [
    successState,
    existingState,
  ])

  const [signedUpWithProvider, signedUpDecisionCallback, signedUpOptions] = useMemo(
    () => ['withProvider', 'onDecision', 'options'].map(prop => get(existingState, prop, null)),
    [existingState],
  )

  /* eslint-disable */

  const { torusInitialized, handleLoginMethod } = useMemo(() => torusOptions || { torusInitialized: false }, [
    torusOptions,
  ])

  const successScreenOptions = useMemo(() => successState || { delay: Config.authSuccessDelay, callback: null }, [
    successState,
  ])

  /* eslint-enable */

  const setSuccessfull = useCallback(
    (callback = null, delay = null) => {
      setSuccessState({ delay, callback })
    },
    [setSuccessState],
  )

  const setAlreadySignedUp = useCallback(
    (withProvider, options, onDecision = null) => {
      setExistingState(withProvider ? { withProvider, options, onDecision } : null)        
    },
    [setExistingState],
  )

  const setTorusInitialized = useCallback(
    handleLoginMethod => {
      setTorusOptions({ torusInitialized: true, handleLoginMethod })
    },
    [setTorusOptions],
  )

  const contextValue = {
    preparing,
    setWalletPreparing,

    alreadySignedUp,
    signedUpWithProvider,
    signedUpDecisionCallback,
    signedUpOptions,
    setAlreadySignedUp,

    success,
    successScreenOptions,
    setSuccessfull,

    handleLoginMethod,
    torusInitialized,
    setTorusInitialized,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContext
