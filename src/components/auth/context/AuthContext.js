import { get } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'

import Config from '../../../config/config'

const AuthContext = React.createContext({
  success: false,
  preparing: false,
  activeStep: 0,
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
  const [activeStep, setStep] = useState(0)
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

  const { torusInitialized, handleLoginMethod } = useMemo(() => torusOptions || { torusInitialized: false }, [
    torusOptions,
    // eslint-disable-next-line array-bracket-newline
  ])

  const successScreenOptions = useMemo(() => successState || { delay: Config.authSuccessDelay, callback: null }, [
    successState,
    // eslint-disable-next-line array-bracket-newline
  ])

  const setActiveStep = useCallback(
    step => {
      let activeStep = step || 0

      activeStep = Math.max(0, activeStep)
      activeStep = Math.min(3, activeStep)

      setStep(activeStep)
    },
    [setStep],
  )

  const setSuccessfull = useCallback(
    (callback = null, delay = null) => {
      setActiveStep(3)
      setSuccessState({ delay, callback })
    },
    [setSuccessState, setActiveStep],
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

    activeStep,
    setActiveStep,

    handleLoginMethod,
    torusInitialized,
    setTorusInitialized,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContext
