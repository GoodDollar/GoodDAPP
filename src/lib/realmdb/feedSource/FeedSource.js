import AsyncStorage from '../../utils/asyncStorage'

export default class FeedSource {
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
