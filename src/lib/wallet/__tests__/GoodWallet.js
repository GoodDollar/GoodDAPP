import goodWallet from '../GoodWallet'

beforeAll(() => {
  jest.resetAllMocks()

  jest.mock('web3-providers-http', () => () => {
    const Config = require('../../../config/config').default
    return require('ganache-cli').provider({ network_id: Config.networkId })
  })
})

describe('Wallet Creation', () => {
  it(`should create wallet property`, () => {
    goodWallet.ready.then(() => {
      const { wallet } = goodWallet

      expect(wallet).toBeDefined()
      expect(wallet).not.toBeNull()
      expect(wallet.wallet).toBeDefined()
      expect(wallet.wallet).not.toBeNull()
    })
  })
})

describe('Wallet Initialization', () => {
  it(`should initialize wallet property`, () => {
    const numOfAcoounts = 10

    goodWallet.ready.then(() => {
      const { wallet } = goodWallet

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
})
