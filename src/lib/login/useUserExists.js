// @flow
import { useCallback } from 'react'
import { default as API } from '../API'
import { useWallet } from '../wallet/GoodWalletProvider'

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

      return API.userExistsCheck({ identifier, email, mobile }).then(({ data }) => data)
    },
    [goodWallet],
  )

  return userExists
}

export default useUserExists
