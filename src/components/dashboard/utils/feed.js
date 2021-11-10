import { useMemo } from 'react'
import { get, isArray, isEmpty } from 'lodash'

import uuid from '../../../lib/utils/uuid'
import Config from '../../../config/config'

export const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}

export const emptyFeed = { type: 'empty', data: {} }

// the key should be always the same value.
// so we'll use WeakMap to keep item -> id linked
// 'createdDate' couldn't be used as the unique value
// as it's stringified an millisecomds (which are making)
// timestamps unique are lost
const itemKeyMap = new WeakMap()

export const keyExtractor = item => {
  const { id } = item

  if (id && String(id).length >= 60) {
    return id
  }

  if (!itemKeyMap.has(item)) {
    itemKeyMap.set(item, uuid())
  }

  return itemKeyMap.get(item)
}

export const useFeeds = (data, includeInvites = true) =>
  useMemo(() => {
    if (!isArray(data) || isEmpty(data)) {
      return [emptyFeed]
    }

    if (includeInvites && Config.enableInvites) {
      return data
    }

    return data.filter(item => get(item, 'type') !== 'invite')
  }, [data, includeInvites])
