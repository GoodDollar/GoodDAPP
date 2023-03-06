import { useContext, useEffect, useMemo, useState } from 'react'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'
import { FVFlowContext } from '../standalone/context/FVFlowContext'

const useEnrollmentIdentifier = () => {
  const [identifier, setIdentifier] = useState()
  const userStorage = useUserStorage()
  const wallet = useWallet()
  const { faceIdentifier, chainId, isFVFlow } = useContext(FVFlowContext)

  useEffect(() => {
    if (!isFVFlow) {
      userStorage.getFaceIdentifier().then(_ => setIdentifier(_))
    }
  }, [isFVFlow])

  return useMemo(() => {
    if (isFVFlow) {
      return [faceIdentifier, chainId]
    }

    if (userStorage && wallet && identifier) {
      return [identifier, wallet.networkId, wallet.getAccountForType('faceVerification')]
    }
  }, [faceIdentifier, userStorage, wallet, identifier])
}

export default useEnrollmentIdentifier
