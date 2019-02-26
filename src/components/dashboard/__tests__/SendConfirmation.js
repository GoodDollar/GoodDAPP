import React from 'react'
import { getWebRouterComponentWithMocks } from './__util__'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

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
