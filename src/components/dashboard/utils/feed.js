import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { get, isArray, isEmpty } from 'lodash'

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
    itemKeyMap.set(item, uuidv4())
  }

  return itemKeyMap.get(item)
}

export const useFeeds = data =>
  useMemo(() => {
    if (!isArray(data) || isEmpty(data)) {
      return [emptyFeed]
    }

    if (Config.enableInvites) {
      return data
    }

    return data.filter(item => get(item, 'type') !== 'invite')
  }, [data])
