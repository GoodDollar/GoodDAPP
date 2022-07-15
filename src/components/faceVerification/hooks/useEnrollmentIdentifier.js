import { useContext, useMemo } from 'react'

import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'
import { LoginFlowContext } from '../standalone/context/LoginFlowContext'

const useEnrollmentIdentifier = () => {
  const userStorage = useUserStorage()
  const { faceIdentifier, isLoginFlow } = useContext(LoginFlowContext)

  const enrollmentIdentifier = useMemo(() => {
    if (isLoginFlow) {
      return faceIdentifier
    }

    if (userStorage) {
      return userStorage.getFaceIdentifier()
    }
  }, [faceIdentifier, userStorage])

  return enrollmentIdentifier
}

export default useEnrollmentIdentifier
