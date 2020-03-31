import { get } from 'lodash'
import userStorage from '../gundb/UserStorage'
const fromDate = new Date('2019/12/26')

/**
 * set status to broken send feed
 * @returns {Promise<void>}
 */
const fixSendFeedStatus = async (lastUpdate, prevVersion, logger) => {
  try {
    const feeds = await userStorage.getAllFeed()
    const promises = []
    for (const feedItem of feeds) {
      if (
        get(feedItem, 'type') === 'send' &&
        get(feedItem, 'status') === 'completed' &&
        get(feedItem, 'data.otplData') === undefined
      ) {
        logger.info('fixSendFeedStatus: Change feed status to pending', feedItem)
        promises.push(userStorage.updateOTPLEventStatus(feedItem.id, 'pending'))
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises)
    }
    logger.info('fixSendFeedStatus: done fixing. total items:', promises.length)
  } catch (e) {
    logger.error('fixSendFeedStatus error', e.message, e)
  }
}

export default { fromDate, update: fixSendFeedStatus, key: 'fixSendStatus' }
