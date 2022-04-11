// eslint-disable-next-line import/order
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

jest.doMock('../../../lib/wallet/GoodWallet', () => {
  return {
    account: 'face-account-wallet-address',
  }
})

describe('ReceiveToAddress', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  const ReceiveToAddress = getWebRouterComponentWithMocks('../ReceiveToAddress')

  afterAll(() => jest.dontMock('../../../lib/wallet/GoodWallet'))

  it('renders without errors', () => {
    const tree = renderer.create(<ReceiveToAddress />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ReceiveToAddress />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
