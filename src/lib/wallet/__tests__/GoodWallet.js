import goodWallet from '../GoodWallet'

describe('Wallet Creation', () => {
  let wallet

  beforeEach(() => {
    wallet = goodWallet
  })

  it(`should create wallet property`, () => {
    expect(wallet).toBeDefined()
    expect(wallet).not.toBeNull()
    expect(wallet.wallet).toBeDefined()
    expect(wallet.wallet).not.toBeNull()
  })
})

describe('Wallet Initialization', () => {
  let wallet
  const numOfAcoounts = 10

  beforeEach(() => {
    wallet = goodWallet
  })

  it(`should initialize wallet property`, () => {
    expect(wallet.account).toBeDefined()
    expect(wallet.account).not.toBeNull()
    expect(wallet.accounts).toBeDefined()
    expect(wallet.accounts).not.toBeNull()
    expect(wallet.accounts.length).toEqual(numOfAcoounts)
    expect(wallet.networkId).toBeDefined()
    expect(wallet.networkId).not.toBeNull()
    expect(wallet.identityContract).toBeDefined()
    expect(wallet.identityContract).not.toBeNull()
    expect(wallet.claimContract).toBeDefined()
    expect(wallet.claimContract).not.toBeNull()
    expect(wallet.tokenContract).toBeDefined()
    expect(wallet.tokenContract).not.toBeNull()
    expect(wallet.reserveContract).toBeDefined()
    expect(wallet.reserveContract).not.toBeNull()
    expect(wallet.oneTimePaymentLinksContract).toBeDefined()
    expect(wallet.oneTimePaymentLinksContract).not.toBeNull()
  })
})
