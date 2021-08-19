import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import userStorage from '../UserStorage'
import defaultGun from '../../gundb/gundb'
import { FeedStorage } from '../FeedStorage'
import { initUserStorage } from './__util__'

fromEntries.shim()

jest.setTimeout(20000)

const feedEvent = {
  id: '0x2eb0e2cdd80b2f61e81d3b0d7eea84276f1831e2dff4c49d2bc8f9cee673b73b',
  createdDate: '2021-08-19T06:21:09.324Z',
  date: '2021-08-19T06:21:09.324Z',
  type: 'senddirect',
  data: {
    to: '0x77ceeadfb6b852de370f94e395dd61ca7ad5b30f',
    reason: null,
    category: 'Product',
    amount: '5500',
  },
  status: 'pending',
  _id: '0x2eb0e2cdd80b2f61e81d3b0d7eea84276f1831e2dff4c49d2bc8f9cee673b73b',
}

describe('FeedStorage', () => {
  let feedStorage

  beforeAll(async () => {
    await initUserStorage()
    const { wallet, feedDB } = userStorage
    feedStorage = new FeedStorage(feedDB, defaultGun, wallet, userStorage)
    await feedStorage.init()
  })

  it('should add new event to outbox', async () => {
    await feedStorage.addToOutbox(feedEvent)
    const savedItem = await feedStorage.storage.inboxes.findOne({ txHash: feedEvent.id })
    const userId = feedStorage.storage.user.id
    const recipientPubkey = await feedStorage.userStorage.getUserProfilePublickey(feedEvent.data.to)
    expect(savedItem).toHaveProperty('user_id', userId)
    expect(savedItem).toHaveProperty('txHash', feedEvent.id)
    expect(savedItem).toHaveProperty('recipientPublicKey', recipientPubkey)
  })

  // it('should get event from outbox and decrypt', async () => {
  //   const decrypted = await feedStorage.getFromOutbox(feedEvent)
  //   console.log('DECRYPTED', decrypted)
  // })

  it('should delete record', async () => {
    await feedStorage.storage.inboxes.findOneAndDelete({ txHash: feedEvent.id })
    const savedItem = await feedStorage.storage.inboxes.findOne({ txHash: feedEvent.id })
    expect(savedItem).toBeNull()
  })
})
