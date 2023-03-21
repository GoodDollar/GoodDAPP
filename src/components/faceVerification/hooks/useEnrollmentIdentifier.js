import { useContext, useEffect, useMemo, useState } from 'react'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'
import { FVFlowContext } from '../standalone/context/FVFlowContext'

const useEnrollmentIdentifier = () => {
  const [{ v1Identifier, v2Identifier }, setIdentifiers] = useState({})
  const userStorage = useUserStorage()
  const wallet = useWallet()
  const { faceIdentifier, chainId, isFVFlow } = useContext(FVFlowContext)

  useEffect(() => {
    if (!isFVFlow) {
      userStorage.getFaceIdentifiers().then(_ => setIdentifiers(_))
    }
  }, [isFVFlow])

  return useMemo(() => {
    if (isFVFlow) {
      return { faceIdentifier, chainId }
    }

    if (userStorage && wallet && v2Identifier) {
      return {
        faceIdentifier: v2Identifier,
        chainId: wallet.networkId,
        v1FaceIdentifier: v1Identifier,
      }
    }
    return {}
  }, [v1Identifier, v2Identifier, userStorage, wallet])
}

export default useEnrollmentIdentifier
