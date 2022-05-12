// eslint-disable-next-line import/order

import Config from '../../../../config/config'
import { GoodWallet } from '../../../../lib/wallet/GoodWalletClass'

import { routeAndPathForCode } from '../routeAndPathForCode'
import { ACTION_SEND_TO_ADDRESS } from '../sendReceiveFlow'

const goodWallet = new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})

let networkId = 4447
const userStorageMock = {
  getPublicProfile() {
    return {}
  },
}
describe('routeAndPathForCode', () => {
  it(`should fail if code is null`, () => {
    expect.assertions(1)

    return routeAndPathForCode('send', null, goodWallet, userStorageMock).catch(e =>
      expect(e.message).toMatch('Invalid QR Code.'),
    )
  })

  it(`should fail if code is malformed`, () => {
    expect.assertions(1)

    return routeAndPathForCode('send', '123', goodWallet, userStorageMock).catch(e =>
      expect(e.message).toMatch(`Invalid QR Code.`),
    )
  })

  it(`should pass if code is valid`, () => {
    const code = {
      networkId: networkId,
      address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    }

    return routeAndPathForCode('send', code, goodWallet, userStorageMock).then(({ route, params }) => {
      expect(route).toMatch('Amount')
      expect(params).toEqual({
        address: code.address,
        action: ACTION_SEND_TO_ADDRESS,
        type: 'receive',
        nextRoutes: ['Reason', 'SendLinkSummary'],
        profile: expect.any(Object),
        counterPartyDisplayName: undefined,
        amount: undefined,
        reason: undefined,
        category: undefined,
      })
    })
  })

  it(`should fail if screen is invalid`, () => {
    expect.assertions(1)
    const code = { networkId: networkId, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }

    return routeAndPathForCode('invalidScreen', code, goodWallet, userStorageMock).catch(e =>
      expect(e.message).toMatch('Invalid screen specified.'),
    )
  })

  it(`should pass if reason is null or undefined`, () => {
    expect.assertions(1)
    const code = {
      networkId: networkId,
      address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      amount: 40,
    }

    return routeAndPathForCode('send', code, goodWallet, userStorageMock).then(({ route, params }) => {
      expect(route).toMatch('Reason')
    })
  })

  it(`should pass if reason is empty`, () => {
    expect.assertions(1)
    const code = {
      networkId: networkId,
      address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      amount: 40,
      reason: '',
    }
    return routeAndPathForCode('send', code, goodWallet, userStorageMock).then(({ route, params }) => {
      expect(route).toMatch('SendLinkSummary')
    })
  })

  it(`should fail if networkId isn't current network ID is invalid`, () => {
    expect.assertions(1)
    const code = { networkId: 100, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }

    return routeAndPathForCode('invalidScreen', code, goodWallet, userStorageMock).catch(e =>
      expect(e.message).toContain('Invalid network. Code is meant to be used in XDAI network, not on'),
    )
  })
})
