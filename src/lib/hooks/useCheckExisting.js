import { useState } from 'react'

import { useAlreadySignedUp } from '../../components/auth/torus/AuthTorus'
import logger from '../../lib/logger/js-logger'
import { userExists } from '../../lib/login/userExists'

const log = logger.child({ from: 'useCheckExisting' })

//check if email/mobile was used to register before and offer user to login instead
const useCheckExisting = (torusProvider, navigation) => {
  const [selection, setSelection] = useState('signup')
  const showAlreadySignedUp = useAlreadySignedUp()

  const getResult = async searchBy => {
    const existsResult = await userExists(searchBy).catch(e => {
      log.warn('userExists check failed:', e.message, e)
      return { exists: false }
    })

    log.debug('checking userAlreadyExist', { existsResult })

    if (existsResult.exists) {
      setSelection(await showAlreadySignedUp(torusProvider, existsResult, searchBy.email ? 'email' : 'mobile'))
      if (selection === 'signin') {
        return navigation.navigate('Auth', { screen: 'signin' })
      }
    }
  }

  return getResult
}

export default useCheckExisting
