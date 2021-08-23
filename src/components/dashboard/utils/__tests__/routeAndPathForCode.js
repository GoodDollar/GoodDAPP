import { initUserStorage } from '../../../../lib/userStorage/__tests__/__util__'

// eslint-disable-next-line import/order
import { assign } from 'lodash'

import API from '../../../../lib/API/api'
import goodWallet from '../../../../lib/wallet/GoodWallet'

import { routeAndPathForCode } from '../routeAndPathForCode'
import { ACTION_SEND_TO_ADDRESS } from '../sendReceiveFlow'

let networkId
const httpProviderMock = jest.fn().mockImplementation(() => {
  return require('ganache-cli').provider({ network_id: networkId })
})

let WEB3PROVIDERS = require('web3-providers')
WEB3PROVIDERS.HttpProvider = httpProviderMock

jest.setTimeout(30000)

describe('routeAndPathForCode', () => {
  const { getProfileBy } = API

  beforeAll(async () => {
    jest.resetAllMocks()

    await initUserStorage()

    await goodWallet.ready
    networkId = goodWallet.networkId

    // eslint-disable-next-line require-await
    API.getProfileBy = jest.fn().mockImplementation(async () => ({ data: { profilePublickey: null } }))
  })

  afterAll(() => assign(API, { getProfileBy }))

  it(`should fail if code is null`, () => {
    expect.assertions(1)

    return routeAndPathForCode('send', null).catch(e => expect(e.message).toMatch('Invalid QR Code.'))
  })

  it(`should fail if code is malformed`, () => {
    expect.assertions(1)

    return routeAndPathForCode('send', '123').catch(e => expect(e.message).toMatch(`Invalid QR Code.`))
  })

  it(`should pass if code is valid`, () => {
    const code = {
      networkId: networkId,
      address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    }

    return routeAndPathForCode('send', code).then(({ route, params }) => {
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

    return routeAndPathForCode('invalidScreen', code).catch(e => expect(e.message).toMatch('Invalid screen specified.'))
  })

  it(`should pass if reason is null or undefined`, () => {
    expect.assertions(1)
    const code = {
      networkId: networkId,
      address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      amount: 40,
    }

    return routeAndPathForCode('send', code).then(({ route, params }) => {
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
    return routeAndPathForCode('send', code).then(({ route, params }) => {
      expect(route).toMatch('SendLinkSummary')
    })
  })

  it(`should fail if networkId isn't current network ID is invalid`, () => {
    expect.assertions(1)
    const code = { networkId: 100, address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1' }

    return routeAndPathForCode('invalidScreen', code).catch(e =>
      expect(e.message).toContain('Invalid network. Code is meant to be used in XDAI network, not on'),
    )
  })
})
