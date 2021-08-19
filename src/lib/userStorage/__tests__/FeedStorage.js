import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import getDB from '../../realmdb/RealmDB'
import goodWallet from '../../wallet/GoodWallet'
import userStorage from '../UserStorage'
import AsyncStorage from '../../utils/asyncStorage'
import defaultGun from '../../gundb/gundb'
import { FeedStorage } from '../FeedStorage'

fromEntries.shim()

jest.setTimeout(10000)

const feedEvent = {
  // id: '0x2eb0e2cdd80b2f61e81d3b0d7eea84276f1831e2dff4c49d2bc8f9cee673b73a',
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

  // _id: '0x2eb0e2cdd80b2f61e81d3b0d7eea84276f1831e2dff4c49d2bc8f9cee673b73a',
  _id: '0x2eb0e2cdd80b2f61e81d3b0d7eea84276f1831e2dff4c49d2bc8f9cee673b73b',
}

describe('FeedStorage', () => {
  let feedStorage

  beforeAll(async () => {
    await AsyncStorage.setItem(
      'GD_jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiMHg1YjliNDlmZjM1ZmE4OWZkMWZiOWNmNGJmNTNkNmI1MDA5ZmVjNjgxIiwiZ2RBZGRyZXNzIjoiMHg3NDBlMjIxNjFkZWVhYTYwYjhiMGI1Y2RhYWEwOTE1MzRmZjIxNjQ5IiwicHJvZmlsZVB1YmxpY2tleSI6IjlZdFNlSXdELVN3Z080UVIxaHBobGt4dFhleUdESjFIX01PQ3pncWcwWEkuTDN3RTJZUkpOT3c0cUo1UFVST0lRNTk3OVR3RFlCcmFmZGUwTlFkXzFSUSIsImV4cCI6MjIzMzU3MzQzNiwiYXVkIjoicmVhbG1kYl93YWxsZXRfZGV2ZWxvcG1lbnQiLCJzdWIiOiIweDViOWI0OWZmMzVmYTg5ZmQxZmI5Y2Y0YmY1M2Q2YjUwMDlmZWM2ODEiLCJpYXQiOjE2Mjg3NzM0MzZ9.y4EJ6Ban0MJL0TORh_kaO_9CKbGouI9FmuRo9iBgUCo',
    )
    const db = getDB()
    await goodWallet.ready
    const pkey = goodWallet.getEd25519Key('gundb')
    await db.init(pkey)
    feedStorage = new FeedStorage(db, defaultGun, goodWallet, userStorage)
    await feedStorage.init()
  })

  it('should pass', () => {
    expect(true).toBeTruthy()
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
    try {
      // const result = await feedStorage.userStorage.inboxes.findOneAndDelete({ txHash: feedEvent.id })
      await feedStorage.userStorage.inboxes.findOneAndDelete({ txHash: feedEvent.id })

      // console.log('RESULT', result)
    } catch (e) {
      // console.log('EXCEPTION', e)
    }
  })
})
