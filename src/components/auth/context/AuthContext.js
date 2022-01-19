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
  setHandleLoginMethod: callback => {},
})

export const AuthContextProvider = ({ children }) => {
  const [preparing, setWalletPreparing] = useState(false)
  const [successState, setSuccessState] = useState(null)
  const [existingState, setExistingState] = useState(null)
  const [handleLoginMethod, setHandleLoginMethod] = useState(null)

  const [success, alreadySignedUp, torusInitialized] = useMemo(
    () => [successState, existingState, handleLoginMethod].map(state => !!state),
    [successState, existingState, handleLoginMethod],
  )

  const [signedUpWithProvider, signedUpDecisionCallback, signedUpOptions] = useMemo(
    () => ['withProvider', 'onDecision', 'options'].map(prop => get(existingState, prop, null)),
    [existingState],
  )

  const successScreenOptions = useMemo(
    // eslint-disable-line
    () => successState || { delay: Config.authSuccessDelay, callback: null }, // eslint-disable-line
    [successState], // eslint-disable-line
  ) // eslint-disable-line

  const setSuccessfull = useCallback(
    (callback = null, delay = null) => {
      setSuccessState({ delay, callback })
    },
    [setSuccessState],
  )

  const setAlreadySignedUp = useCallback(
    (withProvider, options, onDecision = null) => {
      setExistingState({ withProvider, options, onDecision })
    },
    [setExistingState],
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
    setHandleLoginMethod,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContext
