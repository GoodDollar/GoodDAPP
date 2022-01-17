import { useCallback } from 'react'

import logger from '../../lib/logger/js-logger'
import { userExists } from '../../lib/login/userExists'

const log = logger.child({ from: 'useCheckExisting' })

//check if email/mobile was used to register before and offer user to login instead
const useCheckExisting = () => {
  // const [, setSelection] = useState('signup')

  const checkExisting = useCallback(async (torusProvider, searchBy) => {
    const { exists, provider } = (await userExists(searchBy).catch(e => {
      log.warn('userExists check failed:', e.message, e)
    })) || { exists: false }

    log.debug('checking userAlreadyExist', { exists })

    if (!exists) {
      return false
    }

    if (searchBy.typeOfLogin === provider) {
      return true
    }

    return 'AccountAlreadyExists'
  }, [])

  return checkExisting
}

export default useCheckExisting
