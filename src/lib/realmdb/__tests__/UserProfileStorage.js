import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import { UserProfileStorage } from '../../userStorage/UserProfileStorage'
import { default as goodWallet } from '../../wallet/GoodWallet'
import getDB from '../../realmdb/RealmDB'
import AsyncStorage from '../../utils/asyncStorage'

fromEntries.shim()

jest.setTimeout(30000)

const profile = {
  _id: {
    $oid: '6100139203f6bf504bbe810d',
  },
  user_id: '6100127ad24e71c3caec42eb',
  avatar: {
    display: 'bafkreibnoelefnzgwbcacyt4vh52ymxvzbjq7mmqhtcnwarfq4lzegsiqe',
    value:
      't1OiSz4ptz/Rxv29opu07ZKupysdrw1tP+cIpYw6TmUb60LeYzYPFrt3PY0RJOfacm31c4dTllAcPb4uzJeGhvyDfX6KE7+fas76ToA8ZnFdauxmPQwLcuSdBiM3oYNuYQgZLMnOZIWvm4dlLvaS+sluF6fVaReWOJWMLKARce4FrgNIQw==',
    privacy: 'public',
  },
  email: {
    display: 'lukasz.kilaszewski@polcode.net',
    value:
      'htz83RVvIe5YlZdgFt8LhIfa6aYsN8cc8hD7LZ2XMt1LzpDikbj0F4uTtcEGAD8Vh3SIQzHMuRcY1cVTPKlVFqNeAjnvbKsj/gPFnRoRCCs914PpAT0jg7wLh58Y+2Qm7SpOjxZMtSY=',
    privacy: 'public',
  },
  fullName: {
    value:
      'EDcT/Ttho7weahofyNu5v5HdWX1LeTPjODinVbss16PKileHAsAdCDODCP3DEakm6FQkYBN+hwQSJQAb7oHCVWlvs6pZfl1gMR3ssuKlA0Jw2PF4tT+UZldTB5yw',
    display: 'Łukasz Kilaszewski',
    privacy: 'public',
  },
  mnemonic: {
    value: 'wvrhHwnTJt3+xp4d1Y6Z/9nBWARHyY0sBkf6tkwpuumX47zHtVAoywAo0Az+i10pvPMc/nyUBF4fOKDOyIrSxKE3wOdBm46H+EjqNg==',
    display: '',
    privacy: 'public',
  },
  username: {
    value:
      'PdmZlFG/wzx0wn9UPx2TszOrZT9kjyJLNv9GwYtOmjzT7QBLtXFQoTw8a/Uk2rVxiGkZeOJ04iBZ67sg9wQad1uy5OlfH6n1+3Odx7GPDzvXkps9',
    display: 'UncleBilly',
    privacy: 'public',
  },
  mobile: {
    display: '+48518205270',
    value:
      'j2I3e0oTvRHYDQRci3igtPJLmOPhiLsZV6W+M2ZsekrEx9Oe9DiSva3DzManAcUVxD9EoI/wtksfyGgUsbZ0nlRdMxUWqXeUZ3xTheytE/HQrbiZ+ok=',
    privacy: 'public',
  },
  walletAddress: {
    value:
      'RXrwzZEapanWWd8croW4l/cPbYOFiDgQlxhKXMq0d4M6r0N8iaFSGK8GGAkw4bnNt2CkPdYjVV31w24Ppm6FXT8LxB0ggMPD6dwl1spOHhVbgP3iU3Zg5EElADWkQKIy9hZ6IkbY/U4SIST1oSZB5BK6Q3E=',
    display: '0x70F2C175CFB5C4a6E9ad18eeF8A417DC7520Ff50',
    privacy: 'public',
  },
  smallAvatar: {
    display: null,
    value: 'RFmpGhPLnqtuKz6PwZxvmoFV6hjWlFHnVqKQvflnv9HabfkO0Vgf8GqMspO2nkOgpbbvYJRBtVoAREbPdQxzVBJ4GyiPFZe2RbSTuQ==',
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

  it('should initialize without profile in db', async () => {
    jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => null)
    await userProfileStorage.init()
    expect(userProfileStorage.profiledb.getProfile()).toBeNull()
  })

  it('should initialaze with profile in db', async () => {
    jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => profile)
    await userProfileStorage.init()
  })
})
