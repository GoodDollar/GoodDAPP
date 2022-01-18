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

    success,
    successScreenOptions,
  } = useContext(AuthContext)

  const successDelay = useMemo(() => get(successScreenOptions, 'delay'), [successScreenOptions])
  const successCallback = useMemo(() => get(successScreenOptions, 'callback'), [successScreenOptions])

  if (preparing) {
    return <WalletPreparing />
  }

  if (alreadySignedUp) {
    return <AccountAlreadyExists checkResult={signedUpWithProvider} onDecision={signedUpDecisionCallback} />
  }

  if (success) {
    return <WelcomeGDScreen showDelay={successDelay} onAfterShown={successCallback} />
  }

  return children
}

export default AuthStateWrapper
