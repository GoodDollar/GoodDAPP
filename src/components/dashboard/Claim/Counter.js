// @flow

import React, { useCallback, useEffect, useState } from 'react'
import userStorage from '../../../lib/gundb/UserStorage'
import Config from '../../../config/config'
import FeedInfo from '../../common/animations/Feed/Info/Info'
import Text from '../../common/view/Text'

const claimDaysThreshold = 14
const claimDaysProperty = 'countClaim'

export const UseClaimFeedText = ({ styles }) => (
  <Text numberOfLines={1} color="gray80Percent" fontSize={10} textTransform="capitalize" style={styles.message}>
    {'You`ve claimed G$ for 14 days & your spot is secured'}
  </Text>
)
export const eventSettings = theme => {
  return {
    color: theme.colors.primary,
    component: FeedInfo,
    name: 'info',
    withoutAmount: true,
    withoutAvatar: true,
  }
}

export const longUseOfClaims = {
  id: '5',
  type: 'useclaim',
  status: 'completed',
  data: {
    customName: 'Congrats! You’ve made it!',
    subtitle: 'Congrats! You’ve made it!',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'Nice work.\n' +
      'You’ve claimed G$ for 14 days and your spot is now secured for GoodDollar’s live launch. \n' +
      'G$ are coming your way soon!',
    endpoint: {
      fullName: 'Congrats! You’ve made it!',
    },
  },
}

const { userProperties } = userStorage

export const useClaimCounter = () => {
  if (!Config.isPhaseZero) {
    return []
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [claimsCount, setClaimsCount] = useState(0)
  const isReachedClaimsThreshold = claimsCount >= claimDaysThreshold

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const advanceClaimsCounter = useCallback(async () => {
    const newClaimsCount = claimsCount + 1

    await userProperties.set(claimDaysProperty, newClaimsCount)

    if (newClaimsCount === claimDaysThreshold) {
      await userStorage.enqueueTX(longUseOfClaims)
    }

    setClaimsCount(newClaimsCount)
  }, [isReachedClaimsThreshold, setClaimsCount, claimsCount])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const initializeClaimsCount = async () => {
      const count = await userProperties.get(claimDaysProperty)
      setClaimsCount(count)
    }

    initializeClaimsCount()
  }, [])

  return [isReachedClaimsThreshold, advanceClaimsCounter]
}
