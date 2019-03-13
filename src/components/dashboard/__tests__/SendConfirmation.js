import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('SendConfirmation', () => {
  it('renders without errors', () => {
    const SendConfirmation = getWebRouterComponentWithMocks('../SendConfirmation')
    const tree = renderer.create(<SendConfirmation />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendConfirmation = getWebRouterComponentWithMocks('../SendConfirmation')
    const component = renderer.create(<SendConfirmation />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
