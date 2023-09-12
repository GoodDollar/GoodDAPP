import { FeedCategories } from '../userStorage/FeedCategory'
import { FeedItemType } from '../userStorage/FeedStorage'
import AsyncStorage from '../utils/asyncStorage'

export class FeedSource {
  get Feed() {
    const { db } = this.db

    return db.Feed
  }

  static create(db, logger) {
    return new this(db, AsyncStorage, logger)
  }

  constructor(db, storage, logger) {
    this.db = db
    this.log = logger
    this.storage = storage
  }

  // eslint-disable-next-line require-await
  async syncFromRemote() {
    throw new Error('Method not implemented')
  }
}

export const makeCategoryMatcher = category => ({ type }) => {
  const isNews = FeedItemType.EVENT_TYPE_NEWS === type

  switch (category) {
    case FeedCategories.News:
      return isNews
    case FeedCategories.Transactions:
      return !isNews
    default:
      return true
  }
}
