import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('Reason', () => {
  it('renders without errors', () => {
    const Reason = getWebRouterComponentWithMocks('../Reason')
    const tree = renderer.create(<Reason />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Reason = getWebRouterComponentWithMocks('../Reason')
    const component = renderer.create(<Reason />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
