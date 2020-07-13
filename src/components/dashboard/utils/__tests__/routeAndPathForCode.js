import { routeAndPathForCode } from '../routeAndPathForCode'
import goodWallet from '../../../../lib/wallet/GoodWallet'
import { ACTION_SEND } from '../sendReceiveFlow'

let networkId
const httpProviderMock = jest.fn().mockImplementation(() => {
  return require('ganache-cli').provider({ network_id: networkId })
})

let WEB3PROVIDERS = require('web3-providers')
WEB3PROVIDERS.HttpProvider = httpProviderMock

describe('routeAndPathForCode', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    await goodWallet.ready
    networkId = goodWallet.networkId
  })

  it(`should fail if code is null`, () => {
    expect.assertions(1)

    return routeAndPathForCode('send', null).catch(e => expect(e.message).toMatch('Invalid QR Code.'))
  })

  it(`should fail if code is malformed`, () => {
    expect.assertions(1)

    return routeAndPathForCode('send', '123').catch(e => expect(e.message).toMatch(`Invalid QR Code.`))
  })

  it(`should pass if code is valid`, () => {
    const code = { networkId: networkId, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }

    return routeAndPathForCode('send', code).then(({ route, params }) => {
      expect(route).toMatch('Amount')
      expect(params).toEqual({
        to: code.address,
        nextRoutes: ['Reason', 'SendQRSummary'],
        params: { action: ACTION_SEND, type: 'receive' },
      })
    })
  })

  it(`should fail if screen is invalid`, () => {
    expect.assertions(1)
    const code = { networkId: networkId, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }

    return routeAndPathForCode('invalidScreen', code).catch(e => expect(e.message).toMatch('Invalid screen specified.'))
  })

  it(`should fail if networkId isn't current network ID is invalid`, () => {
    expect.assertions(1)
    const code = { networkId: 100, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }

    return routeAndPathForCode('invalidScreen', code).catch(e =>
      expect(e.message).toContain('Invalid network. Code is meant to be used in XDAI network, not on'),
    )
  })
})
