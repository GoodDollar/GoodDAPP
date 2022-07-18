// @flow
import { useCallback } from 'react'
import { default as API, throwException } from '../API'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'useUserExists' })

const useUserExists = () => {
  const userExists = useCallback(
    // eslint-disable-next-line require-await
    async (wallet = null, query = {}) => {
      let identifier
      const { email, mobile } = query || {}

      if (wallet) {
        identifier = wallet.getAccountForType('login')
      }

      if (![identifier, email, mobile].some(Boolean)) {
        return { exists: false }
      }

      try {
        const { data } = await API.userExistsCheck({ identifier, email, mobile }).catch(throwException)

        return data
      } catch (exception) {
        const { message } = exception

        log.error('userExistsCheck failed: ', message, exception)
        throw exception
      }
    },
    [],
  )

  return userExists
}

export default useUserExists
