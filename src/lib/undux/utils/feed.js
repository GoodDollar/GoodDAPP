// @flow
import type { Effects, Store } from 'undux'

import userStorage from '../../gundb/UserStorage'
import GDStore, { type State } from '../GDStore'

const PAGE_SIZE = 10

export const getInitialFeed = async (store: Store) => {
  const feeds = await userStorage.getStandardizedFeed(PAGE_SIZE, true)
  store.set('feeds')(feeds)
}

export const getNextFeed = async (store: Store) => {
  console.log('getNextFeed')
  const currentFeeds = store.get('feeds')
  const newFeeds = await userStorage.getStandardizedFeed(PAGE_SIZE, false)
  store.set('feeds')([...currentFeeds, ...newFeeds])
}

export const useFeedActions = () => {
  const store = GDStore.useStore()
  return {
    getInitialFeed: getInitialFeed.bind(null, store),
    getNextFeed: getNextFeed.bind(null, store)
  }
}
