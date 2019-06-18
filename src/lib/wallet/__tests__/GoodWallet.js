import { BN } from 'web3-utils'
import goodWallet from '../GoodWallet'

const httpProviderMock = jest.fn().mockImplementation(() => {
  const Config = require('../../../config/config').default
  console.info('returning mock')
  return require('ganache-cli').provider({ network_id: Config.networkId })
})

let WEB3PROVIDERS = require('web3-providers')
WEB3PROVIDERS.HttpProvider = httpProviderMock

beforeAll(() => {
  jest.resetAllMocks()
})

describe('Polling for events', () => {
  it(`should stop polling after cancel returns true`, () => {
    // Given
    const contract = {
      getPastEvents() {
        return Promise.resolve([])
      }
    }

    return new Promise(async resolve => {
      // When
      await goodWallet.ready
      goodWallet.setBlockNumber(new BN(1))
      goodWallet.pollForEvents(
        { event: 'Transfer', contract },
        () => {},
        () => {
          goodWallet.setBlockNumber(goodWallet.blockNumber.add(new BN(1)))
          const shouldCancel = goodWallet.blockNumber > 7

          if (shouldCancel) {
            resolve(undefined)
          }

          return shouldCancel
        },
        1
      )
    }).then(() => {
      // Then
      expect(goodWallet.blockNumber.toString()).toEqual('8')
    })
  })

  it(`should fail if no callback is provided`, () => {
    // Given
    const contract = {
      getPastEvents() {
        return Promise.resolve([])
      }
    }

    return new Promise(async (resolve, reject) => {
      await goodWallet.ready

      // When
      try {
        await goodWallet.pollForEvents({ event: 'Transfer', contract })
      } catch (e) {
        reject(e)
      }
    }).catch(error => {
      // Then
      expect(error.message).toBe('callback must be provided')
    })
  })

  it(`should fail if no event is provided`, () => {
    // Given
    const contract = {
      getPastEvents() {
        return Promise.resolve([])
      }
    }

    return new Promise(async (resolve, reject) => {
      await goodWallet.ready

      // When
      try {
        await goodWallet.pollForEvents({ contract }, () => {})
      } catch (e) {
        reject(e)
      }
    }).catch(error => {
      // Then
      expect(error.message).toBe('event must be provided')
    })
  })

  it(`should fail if no contract is provided`, () => {
    return new Promise(async (resolve, reject) => {
      // Given
      await goodWallet.ready

      // When
      try {
        await goodWallet.pollForEvents({ event: 'Transfer' }, () => {})
      } catch (e) {
        reject(e)
      }
    }).catch(error => {
      // Then
      expect(error.message).toBe('contract object must be provided')
    })
  })
})

describe('Wallet Initialization', () => {
  it(`should initialize wallet property`, () => {
    const numOfAcoounts = 10

    return goodWallet.ready.then(() => {
      expect(goodWallet.account).toBeDefined()
      expect(goodWallet.account).not.toBeNull()
      expect(goodWallet.accounts).toBeDefined()
      expect(goodWallet.accounts).not.toBeNull()
      expect(goodWallet.accounts.length).toEqual(numOfAcoounts)
      expect(goodWallet.networkId).toBeDefined()
      expect(goodWallet.networkId).not.toBeNull()
      expect(goodWallet.identityContract).toBeDefined()
      expect(goodWallet.identityContract).not.toBeNull()
      expect(goodWallet.claimContract).toBeDefined()
      expect(goodWallet.claimContract).not.toBeNull()
      expect(goodWallet.tokenContract).toBeDefined()
      expect(goodWallet.tokenContract).not.toBeNull()
      expect(goodWallet.reserveContract).toBeDefined()
      expect(goodWallet.reserveContract).not.toBeNull()
      expect(goodWallet.oneTimePaymentLinksContract).toBeDefined()
      expect(goodWallet.oneTimePaymentLinksContract).not.toBeNull()
    })
  })

  it('should get account for type', async () => {
    await goodWallet.ready
    expect(goodWallet.getAccountForType('gd')).toBe(goodWallet.accounts[0].address)
    expect(goodWallet.getAccountForType('zoomId')).toBe(goodWallet.accounts[5].address)
  })
})

describe('Wallet Creation', () => {
  it(`should create wallet property`, () => {
    return goodWallet.ready.then(() => {
      expect(goodWallet).toBeDefined()
      expect(goodWallet).not.toBeNull()
      expect(goodWallet.wallet).toBeDefined()
      expect(goodWallet.wallet).not.toBeNull()
    })
  })
})
