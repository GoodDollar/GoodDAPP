import goodWallet from '../GoodWallet'

const httpProviderMock = jest.fn().mockImplementation(() => {
  const Config = require('../../../config/config').default
  console.log('returning mock')
  return require('ganache-cli').provider({ network_id: Config.networkId })
})

let WEB3PROVIDERS = require('web3-providers')
WEB3PROVIDERS.HttpProvider = httpProviderMock

beforeAll(() => {
  jest.resetAllMocks()
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

  it('should get account for type', async () => {
    await goodWallet.ready
    expect(goodWallet.getAccountForType('gd')).toBe(goodWallet.accounts[0].address)
    expect(goodWallet.getAccountForType('zoomId')).toBe(goodWallet.accounts[5].address)
  })
})
