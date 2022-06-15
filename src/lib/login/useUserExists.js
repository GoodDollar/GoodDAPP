// @flow
import { useCallback } from 'react'
import { default as API, getErrorMessage } from '../API'
import { useWallet } from '../wallet/GoodWalletProvider'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'useUserExists' })

const useUserExists = () => {
  const goodWallet = useWallet()

  const userExists = useCallback(
    // eslint-disable-next-line require-await
    async ({ mnemonics, privateKey, email, mobile }) => {
      let identifier

      if (goodWallet) {
        identifier = goodWallet.getAccountForType('login')
      }

      if (![identifier, email, mobile].find(_ => _)) {
        return { exists: false }
      }

      return API.userExistsCheck({ identifier, email, mobile })
        .then(({ data }) => data)
        .catch(e => log.warn('userExistsCheck failed: ', getErrorMessage(e), e))
    },
    [goodWallet],
  )

  return userExists
}

export default useUserExists
