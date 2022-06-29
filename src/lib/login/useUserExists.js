// @flow
import { useCallback } from 'react'
import { default as API, throwException } from '../API'
import { useWallet } from '../wallet/GoodWalletProvider'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'useUserExists' })

const useUserExists = () => {
  const goodWallet = useWallet()

  const userExists = useCallback(
    // eslint-disable-next-line require-await
    async ({ mnemonics, privateKey, email, mobile }, withWallet = null) => {
      let identifier
      let wallet = withWallet || goodWallet

      // setting wallet to explicit false will skip sending ID
      // this needs for by email/mobile chrck, see SignupState
      if (false !== withWallet && wallet) {
        identifier = wallet.getAccountForType('login')
      }

      if (![identifier, email, mobile].find(_ => _)) {
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
    [goodWallet],
  )

  return userExists
}

export default useUserExists
