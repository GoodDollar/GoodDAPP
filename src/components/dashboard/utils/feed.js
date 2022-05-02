import { useMemo } from 'react'
import { isArray, isEmpty } from 'lodash'

import uuid from '../../../lib/utils/uuid'
import Config from '../../../config/config'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { FeedCategories } from '../../../lib/userStorage/FeedCategory'
import { makeCategoryMatcher } from '../../../lib/realmdb/feed'

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
const defaultFeedFilters = { invites: true, category: FeedCategories.All }

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

export const useFeeds = (data, filters = null) => {
  const store = SimpleStore.useStore()
  const loadAnimShown = store.get('feedLoadAnimShown')
  const feedFilters = useMemo(() => ({ ...defaultFeedFilters, ...(filters || {}) }), [filters])

  return useMemo(() => {
    if (!isArray(data) || isEmpty(data)) {
      return loadAnimShown ? [] : [emptyFeed]
    }

    const { invites, category } = feedFilters
    const matchers = [makeCategoryMatcher(category)]

    if (!invites || !Config.enableInvites) {
      matchers.push(({ type }) => 'invite' !== type)
    }

    return data.filter(item => matchers.every(matcher => matcher(item)))
  }, [data, feedFilters])
}
