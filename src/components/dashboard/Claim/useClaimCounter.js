// @flow
import { useCallback, useEffect, useRef } from 'react'

import Config from '../../../config/config'
import { fireEvent } from '../../../lib/analytics/analytics'

import userStorage from '../../../lib/gundb/UserStorage'
import { CLAIM_TASK_COMPLETED, claimDaysThreshold, longUseOfClaims } from './events'

const claimDaysProperty = 'countClaim'
const { userProperties } = userStorage

export default () => {
  const claimsCountRef = useRef(0)

  const advanceClaimsCounter = useCallback(async () => {
    let { current } = claimsCountRef

    if (!Config.isPhaseZero) {
      return
    }

    if (++current === claimDaysThreshold) {
      fireEvent(CLAIM_TASK_COMPLETED)
      await userStorage.enqueueTX(longUseOfClaims)
    }

    await userProperties.set(claimDaysProperty, current)
    claimsCountRef.current++
  }, [])

  useEffect(() => {
    const initializeClaimsCount = async () => {
      const count = await userProperties.get(claimDaysProperty)

      claimsCountRef.current = count
    }

    if (!Config.isPhaseZero) {
      return
    }

    initializeClaimsCount()
  }, [])

  return advanceClaimsCounter
}
