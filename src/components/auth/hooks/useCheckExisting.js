import { useCallback, useContext } from 'react'

import logger from '../../../lib/logger/js-logger'
import useUserExists from '../../../lib/login/useUserExists'
import AuthContext from '../context/AuthContext'

const log = logger.child({ from: 'useCheckExisting' })

// check if email/mobile was used to register before and offer user to login instead
const useCheckExisting = () => {
  const { setAlreadySignedUp } = useContext(AuthContext)
  const userExists = useUserExists()

  const checkExisting = useCallback(
    async (torusProvider, torusUser, options = {}) => {
      const { eventVars = {}, withWallet = null } = options || {}

      const checkResult = await userExists(withWallet, torusUser).catch(e => {
        log.warn('userExists check failed:', e.message, e)
        return { exists: false }
      })

      const { exists, identifier } = checkResult

      log.debug('checking userAlreadyExist', { withWallet, torusProvider, checkResult })

      // if identifier was sent in request and it exists then user was already signed up,
      // during existing checks form signup we dont pass identifier, so it will never match here
      if (identifier) {
        return 'login'
      }

      if (!exists) {
        return 'signup'
      }

      const analyticsVars = { provider: torusProvider, ...eventVars }

      return new Promise(resolve => setAlreadySignedUp(checkResult, analyticsVars, resolve))
    },
    [userExists],
  )

  return checkExisting
}

export default useCheckExisting
