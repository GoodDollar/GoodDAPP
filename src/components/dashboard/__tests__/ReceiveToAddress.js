import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('ReceiveToAddress', () => {
  it('renders without errors', () => {
    const ReceiveToAddress = getWebRouterComponentWithMocks('../ReceiveToAddress')
    const tree = renderer.create(<ReceiveToAddress />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ReceiveToAddress = getWebRouterComponentWithMocks('../ReceiveToAddress')
    const component = renderer.create(<ReceiveToAddress />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
