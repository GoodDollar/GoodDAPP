import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('TransactionConfirmation', () => {
  it('matches snapshot', async () => {
    const TransactionConfirmation = getWebRouterComponentWithMocks('../TransactionConfirmation')
    let component
    await renderer.act(async () => (component = renderer.create(<TransactionConfirmation />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
