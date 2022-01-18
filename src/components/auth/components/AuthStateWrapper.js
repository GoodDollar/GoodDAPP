import React, { useContext, useEffect } from 'react'
import { get } from 'lodash'

import AuthContext from '../context/AuthContext'
import Config from '../../../config/config'
import restart from '../../../lib/utils/restart'
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

  useEffect(() => {
    let timeoutId
    const delay = get(successScreenOptions, 'delay', Config.authSuccessDelay)
    const callback = get(successScreenOptions, 'callback', () => restart('/'))

    if (success) {
      timeoutId = setTimeout(callback, delay)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [success, successScreenOptions])

  if (preparing) {
    return <WalletPreparing />
  }

  if (alreadySignedUp) {
    return <AccountAlreadyExists checkResult={signedUpWithProvider} onDecision={signedUpDecisionCallback} />
  }

  return success ? <WelcomeGDScreen /> : children
}

export default AuthStateWrapper
