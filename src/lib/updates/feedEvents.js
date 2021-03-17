import { get } from 'lodash'
import userStorage from '../gundb/UserStorage'

const fromDate = new Date('2020/02/26')

/**
 * set status to broken send feed
 * @returns {Promise<void>}
 */
const updateFeedEvent = async (lastUpdate, prevVersion, log) => {
  const feed = await userStorage.getAllFeed()
  log.info(`checking ${feed.length} feed events`)
  const res = await Promise.all(
    feed.map(async feedEvent => {
      const fullName = get(feedEvent, 'data.endpoint.fullName')
      const avatar = get(feedEvent, 'data.endpoint.avatar')
      log.debug('setting feedEvent profile fields', feedEvent)
      const updateFeedEvent = await userStorage.setFeedEventProfileFields(feedEvent)
      log.debug('updated feedEvent object', updateFeedEvent)
      if (
        fullName !== get(updateFeedEvent, 'data.endpoint.fullName') ||
        avatar !== get(updateFeedEvent, 'data.endpoint.avatar')
      ) {
        log.debug('updating feedEvent', updateFeedEvent)
        return userStorage.updateFeedEvent(updateFeedEvent)
      }

      return false
    }),
  )

  const filtered = res.filter(x => !!x)
  log.info(`updated ${filtered.length} feed events`, filtered)
  return filtered
}
export default { fromDate, update: updateFeedEvent, key: 'updateFeedEvents' }
