// @flow
import type { Effects, Store } from 'undux'

import userStorage from '../../gundb/UserStorage'
import pino from '../../logger/pino-logger'
const logger = pino.child({ from: 'feeds' })

export const PAGE_SIZE = 10

export const getInitialFeed = async (store: Store) => {
  const currentScreen = store.get('currentScreen')
  store.set('currentScreen')({ ...currentScreen, loading: true })
  const feeds = await userStorage
    .getStandardizedFeed(PAGE_SIZE, true)
    .catch(err => logger.error('getInitialFeed -> ', err))
  store.set('currentScreen')({ ...currentScreen, loading: false })
  store.set('feeds')(feeds)
}

export const getNextFeed = async (store: Store) => {
  const currentFeeds = store.get('feeds')
  const newFeeds = await userStorage.getStandardizedFeed(PAGE_SIZE, false)
  if (newFeeds.length > 0) {
    store.set('feeds')([...currentFeeds, ...newFeeds])
  }
}
