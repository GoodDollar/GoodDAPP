import { get } from 'lodash'
import userStorage from '../userStorage/UserStorage'

const fromDate = new Date('2021/06/17')

/**
 * fix broken feed items
 * @returns {Promise<void>}
 */
const updateFeedEvents = async (lastUpdate, prevVersion, log) => {
  await userStorage.ready
  await userStorage.wallet.ready
  const feed = await userStorage.getAllFeed()
  log.info(`checking ${feed.length} feed events`)
  const res = await Promise.all(
    feed.map(async feedEvent => {
      const id = feedEvent.id

      const type = feedEvent.type
      const counterPartyFullName = get(feedEvent, 'data.counterPartyFullName', null)
      const counterPartyProfile = get(feedEvent, 'data.counterPartyProfile', null)
      const counterPartyAddress = get(feedEvent, 'data.counterPartyAddress', null)
      if (
        id.startsWith('0x') &&
        type !== 'claim' &&
        type !== 'bonus' &&
        (!counterPartyFullName || !counterPartyProfile || !counterPartyAddress)
      ) {
        const receipt = await userStorage.wallet.getReceiptWithLogs(id).catch(e => {
          log.warn('no receipt found for id:', e.message, e, id)
          return undefined
        })

        if (receipt) {
          log.info('missing data in feedevent, processing receipt again', { id, feedEvent, receipt })
          const event = await userStorage.feedStorage.handleReceipt(receipt)
          log.info('updated feedEvent:', { id, event })
          return event
        }
        log.warn('getFeedPage no receipt found for feedEvent id:', id)
        return null
      }
    }),
  )

  const filtered = res.filter(x => !!x)
  log.info(`updated ${filtered.length} feed events`, filtered)
  return filtered
}
export default { fromDate, update: updateFeedEvents, key: 'updateFeedEvents' }
