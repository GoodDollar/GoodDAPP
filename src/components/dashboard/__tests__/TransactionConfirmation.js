import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('SendConfirmation', () => {
  it('renders without errors', () => {
    const TransactionConfirmation = getWebRouterComponentWithMocks('../TransactionConfirmation')
    const tree = renderer.create(<TransactionConfirmation />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const TransactionConfirmation = getWebRouterComponentWithMocks('../TransactionConfirmation')
    const component = renderer.create(<TransactionConfirmation />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
