import { useContext, useMemo } from 'react'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'
import { FVFlowContext } from '../standalone/context/FVFlowContext'

const useEnrollmentIdentifier = () => {
  const userStorage = useUserStorage()
  const wallet = useWallet()
  const { faceIdentifier, chainId, isFVFlow } = useContext(FVFlowContext)

  return useMemo(() => {
    if (isFVFlow) {
      return [faceIdentifier, chainId]
    }

    if (userStorage && wallet) {
      return [userStorage.getFaceIdentifier(), wallet.networkId]
    }
  }, [faceIdentifier, userStorage, wallet])
}

export default useEnrollmentIdentifier
