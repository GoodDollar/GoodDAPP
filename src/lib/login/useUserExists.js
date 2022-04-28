// @flow
import { useCallback } from 'react'
import { default as API } from '../API/api'
import { useWallet } from '../wallet/GoodWalletProvider'

const useUserExists = () => {
  const goodWallet = useWallet()

  // eslint-disable-next-line require-await
  const userExists = useCallback(async ({ mnemonics, privateKey, email, mobile }) => {
    let identifier

    if (goodWallet) {
      identifier = goodWallet.getAccountForType('login')
    }

    if (![identifier, email, mobile].find(_ => _)) {
      return { exists: false }
    }

    return API.userExistsCheck({ identifier, email, mobile }).then(({ data }) => data)
  })

  return userExists
}

export default useUserExists
