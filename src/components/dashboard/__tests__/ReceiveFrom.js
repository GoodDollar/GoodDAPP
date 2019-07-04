import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('ReceiveFrom', () => {
  it('renders without errors', () => {
    const ReceiveFrom = getWebRouterComponentWithMocks('../ReceiveFrom')
    const tree = renderer.create(<ReceiveFrom />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ReceiveFrom = getWebRouterComponentWithMocks('../ReceiveFrom')
    const component = renderer.create(<ReceiveFrom />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
