import { useContext, useMemo } from 'react'

import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'
import { FVFlowContext } from '../standalone/context/FVFlowContext'

const useEnrollmentIdentifier = () => {
  const userStorage = useUserStorage()
  const { faceIdentifier, isFVFlow } = useContext(FVFlowContext)

  const enrollmentIdentifier = useMemo(() => {
    if (isFVFlow) {
      return faceIdentifier
    }

    if (userStorage) {
      return userStorage.getFaceIdentifier()
    }
  }, [faceIdentifier, userStorage])

  return enrollmentIdentifier
}

export default useEnrollmentIdentifier
