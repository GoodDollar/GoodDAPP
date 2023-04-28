// @flow
import { useCallback, useEffect, useRef } from 'react'

import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'

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
