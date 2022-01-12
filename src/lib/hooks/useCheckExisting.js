import { useCallback, useState } from 'react'

import { useAlreadySignedUp } from '../../components/auth/torus/hooks/useAlreadySignedUp.js'
import logger from '../../lib/logger/js-logger'
import { userExists } from '../../lib/login/userExists'

const log = logger.child({ from: 'useCheckExisting' })

//check if email/mobile was used to register before and offer user to login instead
const useCheckExisting = (torusProvider, navigation) => {
  const [, setSelection] = useState('signup')
  const showAlreadySignedUp = useAlreadySignedUp()

  const checkExisting = useCallback(
    async searchBy => {
      const { exists } = (await userExists(searchBy).catch(e => {
        log.warn('userExists check failed:', e.message, e)
      })) || { exists: false }

      log.debug('checking userAlreadyExist', { exists })

      if (exists) {
        const nextStep = await showAlreadySignedUp(torusProvider, exists, searchBy.email ? 'email' : 'mobile')
        setSelection(nextStep)
        if (nextStep === 'signin') {
          return navigation.navigate('Auth', { screen: 'signin' })
        }
      }
    },
    [navigation, showAlreadySignedUp],
  )

  return checkExisting
}

export default useCheckExisting
