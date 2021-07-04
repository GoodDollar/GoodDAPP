// @flow
import userStorage from '../../userStorage/UserStorage'

describe('UserStorage', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await userStorage.wallet.ready
  })

  it('test userStorage wallet connection', () => {
    const connected = userStorage.wallet.wallet.currentProvider.connected
    expect(connected).toBeTruthy()
  })
})
