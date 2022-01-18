import { get } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'

import Config from '../../../config/config'

const AuthContext = React.createContext({
  success: false,
  preparing: false,
  successCallback: null,
  signedUpProvider: null,
  alreadySignedUp: false,
  successDelay: Config.authSuccessDelay,
  setWalletPreparing: isPreparing => {},
  setAlreadySignedUp: (withProvider, onDecision = null) => {},
  setSuccessfull: (callback = null, delay = null) => {},
})

export const AuthContextProvider = ({ children }) => {
  const [preparing, setWalletPreparing] = useState(false)
  const [successState, setSuccessState] = useState(null)
  const [existingState, setExistingState] = useState(null)

  const alreadySignedUp = useMemo(() => !!existingState, [existingState])
  const signedUpWithProvider = useMemo(() => get(existingState, 'withProvider', null), [existingState])
  const signedUpDecisionCallback = useMemo(() => get(existingState, 'onDecision', null), [existingState])

  const success = useMemo(() => !!successState, [successState])

  const successScreenOptions = useMemo( // eslint-disable-line
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
    (withProvider, onDecision = null) => {
      setExistingState({ withProvider, onDecision })
    },
    [setExistingState],
  )

  const contextValue = useMemo(
    () => ({
      preparing,
      setWalletPreparing,

      alreadySignedUp,
      signedUpWithProvider,
      signedUpDecisionCallback,
      setAlreadySignedUp,

      success,
      successScreenOptions,
      setSuccessfull,
    }),
    [
      preparing,
      setWalletPreparing,

      alreadySignedUp,
      signedUpWithProvider,
      signedUpDecisionCallback,
      setAlreadySignedUp,

      success,
      successScreenOptions,
      setSuccessfull,
    ],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContext
