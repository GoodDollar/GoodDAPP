import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

const address = '0x0000000000000000000000000000000000000000'

describe('ReceiveToAddress', () => {
  it('renders without errors', () => {
    const ReceiveToAddress = getWebRouterComponentWithMocks('../ReceiveToAddress')
    const tree = renderer.create(<ReceiveToAddress address={address} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ReceiveToAddress = getWebRouterComponentWithMocks('../ReceiveToAddress')
    const component = renderer.create(<ReceiveToAddress address={address} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
