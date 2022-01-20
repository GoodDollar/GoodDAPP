import React, { useContext, useMemo } from 'react'
import { get } from 'lodash'

import AuthContext from '../context/AuthContext'
import AccountAlreadyExists from './AccountAlreadyExists'
import WelcomeGDScreen from './WelcomeGD'
import WalletPreparing from './WalletPreparing'

const AuthStateWrapper = ({ children }) => {
  const {
    preparing,

    alreadySignedUp,
    setAlreadySignedUp,
    signedUpWithProvider,
    signedUpDecisionCallback,
    signedUpOptions,
    authNavigator,
    setWalletPreparing,

    success,
    successScreenOptions,

    torusInitialized,
    handleLoginMethod,
  } = useContext(AuthContext)

  const [successDelay, successCallback] = useMemo(
    () => ['delay', 'callback'].map(prop => get(successScreenOptions, prop)),
    [successScreenOptions],
  )

  if (alreadySignedUp) {
    return (
      <AccountAlreadyExists
        checkResult={signedUpWithProvider}
        eventVars={signedUpOptions}
        onDecision={signedUpDecisionCallback}
        onContinueSignup={authNavigator.navigate}
        handleLoginMethod={handleLoginMethod}
        torusInitialized={torusInitialized}
        setAlreadySignedUp={setAlreadySignedUp}
        setWalletPreparing={setWalletPreparing}
      />
    )
  }

  if (success) {
    return <WelcomeGDScreen showDelay={successDelay} onAfterShown={successCallback} />
  }

  return preparing ? <WalletPreparing /> : children
}

export default AuthStateWrapper
