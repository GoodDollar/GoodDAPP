import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import { UserProfileStorage } from '../../userStorage/UserProfileStorage'
import { default as goodWallet } from '../../wallet/GoodWallet'
import getDB from '../../realmdb/RealmDB'
import AsyncStorage from '../../utils/asyncStorage'

fromEntries.shim()

jest.setTimeout(30000)

const profile = {
  avatar: {
    display: '',
    value: '',
    privacy: 'public',
  },
  email: {
    display: 'julian@gooddollar.org',
    value: '',
    privacy: 'public',
  },
  fullName: {
    value: '',
    display: 'Julian Kobryński',
    privacy: 'public',
  },
  mnemonic: {
    value: '',
    display: '',
    privacy: 'public',
  },
  username: {
    value: '',
    display: '',
    privacy: 'public',
  },
  mobile: {
    display: '+48507471353',
    value: '',
    privacy: 'public',
  },
  walletAddress: {
    value: '',
    display: '0x740E22161DEEAa60b8b0b5cDAAA091534Ff21649',
    privacy: 'public',
  },
  smallAvatar: {
    display: '',
    value: '',
    privacy: 'public',
  },
}

describe('UserProfileStorage', () => {
  let userProfileStorage

  beforeAll(async () => {
    await AsyncStorage.setItem(
      'GD_jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiMHg1YjliNDlmZjM1ZmE4OWZkMWZiOWNmNGJmNTNkNmI1MDA5ZmVjNjgxIiwiZ2RBZGRyZXNzIjoiMHg3NDBlMjIxNjFkZWVhYTYwYjhiMGI1Y2RhYWEwOTE1MzRmZjIxNjQ5IiwicHJvZmlsZVB1YmxpY2tleSI6IjlZdFNlSXdELVN3Z080UVIxaHBobGt4dFhleUdESjFIX01PQ3pncWcwWEkuTDN3RTJZUkpOT3c0cUo1UFVST0lRNTk3OVR3RFlCcmFmZGUwTlFkXzFSUSIsImV4cCI6MTYyODYwMzEwNywiYXVkIjoicmVhbG1kYl93YWxsZXRfZGV2ZWxvcG1lbnQiLCJzdWIiOiIweDViOWI0OWZmMzVmYTg5ZmQxZmI5Y2Y0YmY1M2Q2YjUwMDlmZWM2ODEiLCJpYXQiOjE2Mjc5OTgzMDd9.lwXZxCQg0qr5K2EP_v_cDqAPv56lZ6_DYTd-cKjPvJs',
    )
    const db = getDB()
    await goodWallet.ready
    userProfileStorage = new UserProfileStorage(goodWallet, db)
    const seed = goodWallet.wallet.eth.accounts.wallet[goodWallet.getAccountForType('gundb')].privateKey.slice(2)
    await db.init(seed, goodWallet.getAccountForType('gundb')) //only once user is registered he has access to realmdb via signed jwt
  })

  it('should save profile to the db', async () => {
    await userProfileStorage.setProfile(profile)

    const encryptedProfile = await userProfileStorage.profiledb.getProfile()
    const { user_id, _id, ...fields } = encryptedProfile

    // Check if values were encrypted
    Object.keys(fields).forEach(key => {
      expect(profile[key].value).not.toEqual(encryptedProfile[key].value)
    })
  })

  it('should initialize and decrypt values', async () => {
    userProfileStorage.profile = {}
    expect(userProfileStorage.profile).toEqual({})

    await userProfileStorage.init()

    // Exclude user_id and id
    const { user_id, id, ...fields } = userProfileStorage.profile

    // Check if values are the same as in the original object
    Object.keys(fields).forEach(key => {
      expect(fields[key].value).toEqual(profile[key].value)
    })
  })

  // it('should initialize without profile in db', async () => {
  //   jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => null)
  //   await userProfileStorage.init()
  //   expect(userProfileStorage.profiledb.getProfile()).toBeNull()
  // })

  // it('should initialaze with profile in db', async () => {
  //   jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => profile)
  //   await userProfileStorage.init()
  //   // console.log(userProfileStorage.profiledb.getProfile())
  //   console.log(await userProfileStorage.profile)
  //   // console.log(userProfileStorage.getProfile())
  // })
})
