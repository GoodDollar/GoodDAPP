import goodWallet from '../GoodWallet'

describe('Wallet Initialization', () => {
  let wallet

  beforeEach(() => {
    wallet = goodWallet
  })

  it(`should initialize wallet property`, () => {
    expect(wallet).toBeDefined()
    expect(wallet).not.toBeNull()
  })
})
