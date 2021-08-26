import { assign } from 'lodash'
import API from '../../API/api'
import userStorage from '../UserStorage'

describe('UserStorage', () => {
  const { ping, getTrust } = API

  beforeAll(async () => {
    userStorage.getUserProfilePublickey = identifier => {
      return null
    }
    // eslint-disable-next-line require-await
    API.ping = jest.fn().mockImplementation(async () => ({ data: {} }))
    // eslint-disable-next-line require-await
    API.getTrust = jest.fn().mockImplementation(async () => ({ data: {} }))

    await userStorage.wallet.ready
    await userStorage.ready
    await userStorage.initRegistered()
    await userStorage.initFeed()
  })

  afterEach(() => {
    userStorage.unSubscribeProfileUpdates()
  })

  afterAll(() => {
    assign(API, { ping, getTrust })
  })

  it('logins to realmdb', () => {
    expect(userStorage.getProfile()).not.toBeUndefined()
  })
})
