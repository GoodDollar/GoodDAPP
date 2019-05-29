import React from 'react'
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
