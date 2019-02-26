import React from 'react'
import { getWebRouterComponentWithMocks } from './utils'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Amount', () => {
  it('renders without errors', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const tree = renderer.create(<Amount />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const component = renderer.create(<Amount />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
