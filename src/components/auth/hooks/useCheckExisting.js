import { useCallback, useContext } from 'react'

import logger from '../../../lib/logger/js-logger'
import { userExists } from '../../../lib/login/userExists'
import AuthContext from '../context/AuthContext'

const log = logger.child({ from: 'useCheckExisting' })

//check if email/mobile was used to register before and offer user to login instead
const useCheckExisting = () => {
  const { setAlreadySignedUp } = useContext(AuthContext)

  const checkExisting = useCallback(async (torusProvider, torusUser) => {
    const checkResult = (await userExists(torusUser).catch(e => {
      log.warn('userExists check failed:', e.message, e)
    })) || { exists: false }

    const { exists, provider } = checkResult

    log.debug('checking userAlreadyExist', { exists })

    if (!exists) {
      return 'signup'
    }

    // User exists an it is the correct login
    if (torusProvider === provider) {
      return 'login'
    }

    return new Promise(resolve => setAlreadySignedUp(checkResult, resolve))
  }, [])

  return checkExisting
}

export default useCheckExisting
