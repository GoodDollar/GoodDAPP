import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

jest.doMock('../../../lib/wallet/GoodWallet', () => {
  return {
    account: '0x00',
  }
})

describe('ReceiveToAddress', () => {
  const ReceiveToAddress = getWebRouterComponentWithMocks('../ReceiveToAddress')

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
