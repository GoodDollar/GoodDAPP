import React, { useContext, useMemo } from 'react'
import { get } from 'lodash'

import AuthContext from '../context/AuthContext'
import AccountAlreadyExists from './AccountAlreadyExists'
import WelcomeGDScreen from './WelcomeGD'
import WalletPreparing from './WalletPreparing'

const AuthStateWrapper = ({ children }) => {
  const {
    preparing,
    setWalletPreparing,

    alreadySignedUp,
    setAlreadySignedUp,
    signedUpWithProvider,
    signedUpDecisionCallback,
    signedUpOptions,

    success,
    successScreenOptions,

    activeStep,

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
        handleLoginMethod={handleLoginMethod}
        torusInitialized={torusInitialized}
        setAlreadySignedUp={setAlreadySignedUp}
        setWalletPreparing={setWalletPreparing}
      />
    )
  }

  if (success) {
    return <WelcomeGDScreen showDelay={successDelay} afterShown={successCallback} />
  }

  return preparing ? <WalletPreparing activeStep={activeStep} /> : children
}

export default AuthStateWrapper
