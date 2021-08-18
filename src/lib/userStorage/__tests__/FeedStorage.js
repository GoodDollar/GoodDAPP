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
})
