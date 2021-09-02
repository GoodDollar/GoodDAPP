import 'fake-indexeddb/auto'
import * as TextileCrypto from '@textile/crypto'
import fromEntries from 'object.fromentries'
import userStorage from '../UserStorage'
import { FeedStorage, TxType } from '../FeedStorage'
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
    reason: 'random reason',
    category: 'Product',
    amount: '5500',
  },
  status: 'pending',
  _id: '0x2eb0e2cdd80b2f61e81d3b0d7eea84276f1831e2dff4c49d2bc8f9cee673b73b',
}

describe('FeedStorage', () => {
  let feedStorage
  let profilePrivateKey
  const privateKey = TextileCrypto.PrivateKey.fromRandom()

  beforeAll(async () => {
    await initUserStorage()

    profilePrivateKey = userStorage.profilePrivateKey
    feedStorage = new FeedStorage(userStorage)
    await feedStorage.init()
  })

  beforeEach(() => {
    jest.restoreAllMocks()
    userStorage.profilePrivateKey = profilePrivateKey
    feedStorage.storage.privateKey = profilePrivateKey
  })

  it('should add new event to outbox', async () => {
    const publicKey = privateKey.public.toString()

    jest.spyOn(feedStorage.userStorage, 'getUserProfilePublickey').mockImplementation(() => publicKey)
    await feedStorage.addToOutbox(feedEvent)

    const savedItem = await feedStorage.storage.inboxes.findOne({ txHash: feedEvent.id })
    const userId = feedStorage.storage.user.id
    const recipientPubkey = await feedStorage.userStorage.getUserProfilePublickey(feedEvent.data.to)

    expect(savedItem).toHaveProperty('user_id', userId)
    expect(savedItem).toHaveProperty('txHash', feedEvent.id)
    expect(savedItem).toHaveProperty('recipientPublicKey', recipientPubkey)
    expect(savedItem.encrypted).toBeDefined()
  })

  it('should get event from outbox and decrypt', async () => {
    feedStorage.storage.privateKey = privateKey
    userStorage.profilePrivateKey = privateKey

    const { reason, category, amount } = feedEvent.data
    const txData = await feedStorage.getFromOutbox({ id: feedEvent.id, txType: TxType.TX_RECEIVE_GD })

    expect(txData).toHaveProperty('reason', reason)
    expect(txData).toHaveProperty('category', category)
    expect(txData).toHaveProperty('amount', amount)
  })

  it('should delete record', async () => {
    await feedStorage.storage.inboxes.findOneAndDelete({ txHash: feedEvent.id })
    const savedItem = await feedStorage.storage.inboxes.findOne({ txHash: feedEvent.id })

    expect(savedItem).toBeNull()
  })
})
