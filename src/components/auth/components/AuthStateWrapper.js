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
    signedUpWithProvider,
    signedUpDecisionCallback,
    signedUpOptions,

    success,
    successScreenOptions,
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
      />
    )
  }

  if (success) {
    return <WelcomeGDScreen showDelay={successDelay} onAfterShown={successCallback} />
  }

  return preparing ? <WalletPreparing /> : children
}

export default AuthStateWrapper
