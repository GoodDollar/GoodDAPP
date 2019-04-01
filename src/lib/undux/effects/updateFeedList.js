// @flow
import type { Effects, Store } from 'undux'
import userStorage from '../../gundb/UserStorage'
import type { State } from '../GDStore'

const updateFeedList: Effects<State> = (store: Store) => {
  store.on('requestFeeds').subscribe(async requestFeeds => {
    if (requestFeeds) {
      const feeds = await userStorage.getStandardizedFeed(10, false)
      store.set('feeds')(feeds)
    }
  })

  return store
}

export default updateFeedList
