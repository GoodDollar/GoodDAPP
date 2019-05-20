import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('Receive', () => {
  it('renders without errors', () => {
    const Receive = getWebRouterComponentWithMocks('../Receive')
    const tree = renderer.create(<Receive />)
    expect(tree.toJSON()).toBeTruthy()
  })

  // it('matches snapshot', () => {
  //   const Receive = getWebRouterComponentWithMocks('../Receive')
  //   const component = renderer.create(<Receive />)
  //   const tree = component.toJSON()
  //   expect(tree).toMatchSnapshot()
  // })
})
