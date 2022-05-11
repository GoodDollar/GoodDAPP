// @flow
import { useCallback, useEffect, useRef } from 'react'

import Config from '../../../config/config'
import { fireEvent } from '../../../lib/analytics/analytics'
import { longUseOfClaims } from '../../../lib/userStorage/UserStorageClass'
import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'
import { CLAIM_TASK_COMPLETED, claimDaysThreshold } from './events'

const claimDaysProperty = 'countClaim'

export default () => {
  const userStorage = useUserStorage()

  const claimsCountRef = useRef(0)
  const claimsCountInitialized = useRef(null)
  const claimsCountInitializing = useRef(new Promise(resolve => (claimsCountInitialized.current = resolve)))

  const advanceClaimsCounter = useCallback(async () => {
    const { userProperties } = userStorage

    if (claimsCountInitializing.current) {
      return claimsCountInitializing.current.then(advanceClaimsCounter)
    }

    claimsCountRef.current += 1

    if (Config.isPhaseZero && claimsCountRef.current === claimDaysThreshold) {
      fireEvent(CLAIM_TASK_COMPLETED)
      await userStorage.enqueueTX(longUseOfClaims)
    }

    await userProperties.set(claimDaysProperty, claimsCountRef.current)
    return claimsCountRef.current
  }, [userStorage])

  useEffect(() => {
    const { userProperties } = userStorage
    const initializeClaimsCount = async () => {
      const count = await userProperties.get(claimDaysProperty)

      claimsCountRef.current = count
      claimsCountInitialized.current()

      claimsCountInitializing.current = null
      claimsCountInitialized.current = null
    }

    initializeClaimsCount()
  }, [])

  return advanceClaimsCounter
}
