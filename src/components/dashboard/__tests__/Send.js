import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('Send', () => {
  it('renders without errors', () => {
    const Send = getWebRouterComponentWithMocks('../Send')
    const tree = renderer.create(<Send />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Send = getWebRouterComponentWithMocks('../Send')
    const component = renderer.create(<Send />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
