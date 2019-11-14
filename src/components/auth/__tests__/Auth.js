import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

// Note: test renderer must be required after react-native.

describe('Auth', () => {
  it('renders without errors', () => {
    const Auth = getWebRouterComponentWithMocks('../Auth')
    const tree = renderer.create(<Auth />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Auth = getWebRouterComponentWithMocks('../Auth')
    const component = renderer.create(<Auth />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
