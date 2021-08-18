// @flow
import userStorage from '../../userStorage/UserStorage'

describe('UserStorage', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await userStorage.wallet.ready

    //dummy action requirred to trigger conneection for web3 1.5
    await userStorage.wallet.wallet.eth.getBalance('0x5a35C3BC159C4e4afAfadbdcDd8dCd2dd8EC8CBE')
  })

  it('test userStorage wallet connection', () => {
    const connected = userStorage.wallet.wallet.currentProvider.connected
    expect(connected).toBeTruthy()
  })
})
