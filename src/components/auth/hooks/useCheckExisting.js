import { useCallback, useContext } from 'react'

import logger from '../../../lib/logger/js-logger'
import userExists from '../../../lib/login/userExists'
import AuthContext from '../context/AuthContext'

const log = logger.child({ from: 'useCheckExisting' })

// check if email/mobile was used to register before and offer user to login instead
const useCheckExisting = () => {
  const { activeStep, setAlreadySignedUp } = useContext(AuthContext)

  const checkExisting = useCallback(
    async (torusProvider, torusUser, goodWallet, eventVars = {}) => {
      const checkResult = await userExists(torusUser, goodWallet).catch(e => {
        log.warn('userExists check failed:', e.message, e)
        return { exists: false }
      })

      const { exists, provider } = checkResult

      log.debug('checking userAlreadyExist', { provider, torusProvider, exists, activeStep })

      if (!exists) {
        return 'signup'
      }

      // User exists, it is not the number check and it is the correct login
      if (provider?.includes(torusProvider) && activeStep === 1) {
        return 'login'
      }

      const analyticsVars = { provider: torusProvider, ...eventVars }

      return new Promise(resolve => setAlreadySignedUp(checkResult, analyticsVars, resolve))
    },
    [activeStep, setAlreadySignedUp],
  )

  return checkExisting
}

export default useCheckExisting
